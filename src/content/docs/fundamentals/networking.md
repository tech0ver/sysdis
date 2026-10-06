---
title: Networking
description: The networking choices you make in a system design interview, such as protocols, real-time updates, load balancing, regions, and failure handling.
---

Every design has boxes connected by arrows. Each arrow is a network call. It needs a protocol, it takes time, and it can fail. This page covers the choices you make for those arrows: what a call costs, which protocol to use, how to push updates to clients, how to spread traffic, where to put servers, and what to do when a call fails.

## What a new request costs

**Default: reuse connections.** Keep HTTP connections open (keep-alive) and use connection pools between services.

A new HTTPS connection over HTTP/1.1 or HTTP/2 goes through four steps before the response comes back:

1. **DNS** turns the domain name into an IP address. The answer is cached for the time set by its TTL.
2. **TCP** opens a connection with a three-way handshake (SYN, SYN-ACK, ACK).
3. **TLS** checks the server certificate and agrees on encryption keys.
4. **HTTP** sends the request and gets the response.

Steps 2 and 3 each cost round trips before any data moves. A round trip is the time for a message to reach the server and for the answer to come back. On a reused connection you pay only for step 4.

**DNS TTL is a trade-off.** A low TTL lets you move traffic to a new IP address fast, for example in a failover. A high TTL means fewer lookups, but clients keep using the old address for longer.

:::tip[In the interview]
You rarely need to draw these steps. Use them to explain latency: "A new connection costs several round trips, so we keep connections open and put servers close to users."
:::

## TCP or UDP

**Default: TCP.** HTTP/1.1, HTTP/2, gRPC, WebSockets, and database connections all run on it.

| | TCP | UDP |
|---|---|---|
| Connection | Handshake first | None |
| Delivery | Reliable inside one connection: resends lost packets, but the connection itself can break | Best effort, data can be lost |
| Order | In order | No order |
| Data unit | Byte stream, no message boundaries | Separate datagrams, one datagram = one message |
| On packet loss | Data after the lost packet waits until it is resent | Nothing waits |

**Pick UDP** when fresh data is worth more than lost data: live audio and video, game state. A late packet is useless there, so resending it only adds delay. With UDP, the application handles loss, order, and duplicates itself if it cares about them.

Browsers cannot open raw UDP sockets. In the browser, UDP is available only through WebRTC (and inside HTTP/3).

:::note
HTTP/3 runs on QUIC, which runs on UDP. One lost packet no longer blocks unrelated requests on the same connection. You do not need to explain QUIC unless the interviewer asks.
:::

## API protocol: REST, gRPC, or GraphQL

**Default: REST over HTTP.** Model resources (`/users/42/orders`) and use HTTP methods on them. Do not model actions (`/updateUser`).

| | REST | gRPC | GraphQL |
|---|---|---|---|
| Shape | Resources + HTTP methods | Procedures (`CreateOrder`) | One endpoint, client picks the fields |
| Format | Usually JSON | Protocol Buffers (binary) over HTTP/2 | JSON |
| Contract | Optional (an OpenAPI spec file) | Strict `.proto` schema, generated clients | Typed schema |
| Best for | Public APIs, browsers, unknown clients | Calls between your own services | Many clients that need different data |
| Weak side | Over-fetching, many calls for nested data | No direct browser support, harder to debug | Hard to cache and rate-limit |

**Pick gRPC** for calls between your own services when payload size and speed matter, or when you need streaming. Protocol Buffers are smaller and faster to parse than JSON. Browsers cannot call gRPC directly (gRPC sends the call status in HTTP trailers, and browser `fetch` cannot read them), so they need a proxy such as gRPC-Web. A common split: REST at the edge, gRPC inside.

**Pick GraphQL** when many client types (web, mobile, partners) need different shapes of the same data, or one screen needs nested data from many sources. The costs:

- **Caching is harder.** Clients usually send queries as POST requests to one endpoint, and HTTP caches and CDNs do not cache POST. To use them, send queries as GET, often as persisted queries.
- **Rate limits need a cost model.** One query can be cheap or very expensive.
- **Heavy queries.** Deeply nested queries and the N+1 problem can overload the server. You need depth limits and batching.

### HTTP details that change the design

- **Idempotent methods.** A method is idempotent if repeating the same request leaves the same final state. GET, PUT, and DELETE are idempotent. POST is not. Retrying a POST can create a duplicate, so it needs an idempotency key (see [When a call fails](#when-a-call-fails)).
- **Status codes.** `201` means a new resource was created. `202` means the request was accepted but not finished yet, and it may still fail. It is the signal for async processing. `401` means the client is not authenticated ("who are you?"). `403` means the server understood the request and refuses it. `429` means "too many requests". `503` means "try again later".
- **Statelessness.** HTTP does not remember the client between requests. Keep sessions in a shared store, not in one server's memory. Then any server can handle any request.
- **Caching headers.** `Cache-Control: max-age` sets how long a response stays fresh. `ETag` lets the client ask "has it changed?" and get a short `304 Not Modified` instead of the full body.
- **HTTP/2 and HTTP/3.** HTTP/2 sends many requests over one connection at the same time. HTTP/3 does the same over QUIC, so one lost packet does not block the other requests.

:::tip[In the interview]
Say "REST by default" and move on. Spend your time on the API shape (resources, methods, pagination, idempotency) instead of the protocol. Bring up gRPC only for internal traffic where speed matters.
:::

## Pushing updates to clients

When the server must tell the client about new data, **pick the simplest option that works**. Go down this table only as far as you need.

| Option | How it works | Direction | Pick it when |
|---|---|---|---|
| Polling | Client asks every N seconds | Client → server | Updates are rare and a delay of N seconds is fine |
| Long polling | Server holds each request until there is data or a timeout, then the client asks again | Server → client | You need push but cannot add new infrastructure |
| SSE | One long HTTP response that streams text events | Server → client | Feeds, notifications, live scores, LLM token streams |
| WebSocket | HTTP connection upgraded to a two-way channel | Both ways | Chat, collaboration, multiplayer games |
| WebRTC | Direct peer-to-peer connection over UDP | Peer ↔ peer | Audio and video calls |

If a delay of a few seconds is fine, polling is enough. **When you need real push, SSE is the default.** It is plain HTTP, and the browser reconnects by itself and sends the ID of the last event it got (`Last-Event-ID`). If the server keeps recent events, it can resend the missed ones. SSE sends only text and only from the server to the client.

**Pick WebSocket** when the client also sends often. The costs:

- **Each connection is stateful.** It holds memory on one server.
- **No HTTP caching.** Data sent over a WebSocket skips browser and CDN caches. Send live updates over the socket, and load images and other cacheable files over normal HTTP.
- **No delivery acknowledgment.** Messages sent while a client is reconnecting are lost unless your protocol tracks them (see the next section).

Serve SSE and WebSocket over TLS (`https://`, `wss://`). Some old proxies on the network hold back or cut streaming responses, and TLS hides the stream from them. Your own load balancers, proxies, and CDN still decrypt the traffic. Make sure they support streaming, turn off response buffering for SSE, and use idle timeouts longer than your heartbeat interval.

**WebRTC** is for audio and video calls. Most devices sit behind NAT, which blocks new connections from outside, so a WebRTC setup needs:

- a **signaling server** (often over WebSocket) to exchange connection details between peers;
- a **STUN** server, which tells a device its public address;
- a **TURN** relay, which forwards all traffic when a direct connection fails. Relay bandwidth is expensive. How many calls need TURN depends on your users' networks, so measure it and size the relay for it.

For group calls, peers do not connect each to each, because their upload bandwidth runs out fast. A central media server receives each stream and sends it on.

:::tip[In the interview]
Do not reach for WebSockets by default. Say why you need two-way traffic. If you don't, SSE or polling is simpler to run and to scale.
:::

## Running long-lived connections at scale

**Default: stateless connection servers.** A connection server only holds sockets. Important state lives in a shared store, so a client can reconnect to any server.

- **Reconnects are normal.** A WebSocket stays on the server that accepted it. If that server dies or is redeployed, the client must reconnect, maybe to another server. Clients reconnect with exponential backoff (a longer wait after each failed try) and jitter (a random extra wait), so thousands of them do not come back at the same moment.
- **Missed messages.** A reconnect does not bring back what was sent during the gap. When delivery matters, give messages sequence numbers. The client sends the last number it saw, and the server resends the rest from a store.
- **Reaching a specific user.** To send a message to user B, it must reach the server that holds B's connection. Use pub/sub. The app publishes each event to a channel, for example in Redis. Every connection server subscribes and forwards the event to its own clients.
- **Heartbeats.** Send pings to find dead connections and to stop proxies and load balancers from closing idle ones. Many of them close a silent connection after 60 seconds by default.
- **Slow clients.** A client that reads slower than you send creates backpressure (data piles up). Use bounded buffers. Merge or drop updates that a newer one replaces, and disconnect clients that stay too slow.

:::tip[In the interview]
When you add WebSockets, say how a message finds the right server (pub/sub) and what happens on reconnect (sequence numbers and replay). That is what the interviewer will ask next.
:::

## Load balancing

**Default: stateless servers behind an L7 load balancer, round robin, health checks.** L4 and L7 are network layers: an L4 load balancer works with TCP connections, an L7 load balancer reads HTTP requests. Shared state goes to a database or cache, so any server can take any request.

### L4 or L7

| | L4 load balancer | L7 load balancer |
|---|---|---|
| Sees | IP addresses, ports, TCP connection | HTTP: host, path, headers, cookies |
| Routes | Each connection | Each request |
| Can do | Forward any TCP/UDP traffic, keep TLS encrypted to the backend | Path routing, TLS termination, auth, rate limits |
| Cost | Faster, less work per packet | More CPU per request |

**Default: L7** for HTTP APIs. L7 load balancers also carry WebSockets. For long-lived connections, use least connections and set the idle timeout longer than your heartbeat interval.

**Pick L4** for non-HTTP traffic, when TLS must stay encrypted all the way to the backend (TLS passthrough), or when you need raw speed.

**TLS termination** means the load balancer decrypts HTTPS, so it can read and route HTTP. It can then send plain traffic to the backend or encrypt it again.

### Algorithms

| Algorithm | How it picks | Use it when |
|---|---|---|
| Round robin | Each server in turn | Default; requests cost about the same |
| Least connections | Fewest open connections | Long-lived connections (WebSockets, SSE) |
| Least requests / least load | Fewest active requests or lowest measured load | Request cost varies a lot, or many requests share one HTTP/2 connection |
| Weighted | Bigger servers get more traffic | Servers have different sizes |
| By key | Same key (user ID, chat room) → same server | A server keeps local state per key, such as a cache |

For routing by key, use consistent hashing, so adding or removing a server moves only a few keys. Plain `hash mod N` moves most keys when N changes.

### Keeping it available

- **Health checks.** The load balancer probes each server and stops sending traffic to failing ones. Require several failures in a row (and several successes to come back), so one slow response does not remove a healthy server.
- **Connection draining.** Before removing a server, stop sending it new requests and let current ones finish.
- **No single point of failure.** Run more than one load balancer. DNS can return several load balancer addresses, but cached DNS answers make failover slow.
- **Sticky sessions** keep a client on one server. They make failover and rebalancing harder, so use them only when state cannot leave the server.

### Client-side load balancing

Inside your own system, the client can pick a server itself, using a list of healthy instances from service discovery. This removes one hop and suits service-to-service calls. It is common with gRPC. A gRPC client sends all its requests over one long-lived HTTP/2 connection. An L4 load balancer balances connections, not requests, so all requests of that client land on one server. Use client-side load balancing or an L7 load balancer that understands HTTP/2.

:::tip[In the interview]
Draw one load balancer box and say "L7, round robin, health checks, stateless servers". Go deeper only for long-lived connections (least connections, idle timeouts) or for servers with local state (consistent hashing).
:::

## Servers and data for global users

**Default: a CDN for static and cacheable content, and the API in the region nearest to the user.**

Data cannot travel faster than light in fiber, so the only way to cut this delay is to put servers closer to users. Typical round trips:

| Path | Round trip |
|---|---|
| Inside one data center | ~0.5 ms |
| New York ↔ London | ~70 ms measured (~56 ms is the physical minimum in fiber) |
| US West Coast ↔ Europe | ~150 ms |

A new HTTPS connection needs several round trips, so a far server feels slow quickly.

- **CDN.** Cache images, video, JS, and CSS on servers near users. Responses that many users read and that may be a little stale can be cached too. A CDN cuts both latency and load on your servers.
- **Nearest region.** Run the service in several regions and send each user to the closest one. GeoDNS returns a different IP address by the user's location; anycast lets many sites share one IP address, and network routing sends each user to one of them, usually a close one.
- **Keep data near its users.** Partition data by region when users mostly touch local data, for example riders and drivers in one city. If a request still has to call another region, the user waits for that distance again.
- **Shared data across regions is the hard part.** If users in several regions write the same data, you choose between two options. With one leader (the only copy that accepts writes), writes from far regions are slow. With a leader in each region, writes are fast but two regions can change the same data at once and conflict.

:::tip[In the interview]
For global users, say "CDN for static content, nearest region for API calls". Then point out which data must be shared across regions. That is where consistency becomes hard.
:::

## When a call fails

**Default: a deadline on every remote call. Retry only temporary failures, and only for operations that are safe to repeat. Make writes safe to repeat with an idempotency key. Add a circuit breaker for dependencies that can fail for a long time.**

A network call can succeed, fail, or time out. After a timeout you do not know if the other side did the work, so a retry can do it twice.

- **Timeouts and deadlines.** Set a timeout on every outgoing call. Without it, one slow dependency holds threads and connections until the whole service stops. Set a deadline for the whole request and pass the remaining time to downstream calls. gRPC supports deadlines, but it sets none by default: set one on each call.
- **Retries.** Retry only temporary errors (timeouts, `503`, `429`) and only within the remaining deadline. Do not retry `400`: the request itself is wrong. Wait longer after each try (exponential backoff: 100 ms, 200 ms, 400 ms…). Add random jitter, so thousands of clients do not retry at the same moment. Cap the number of tries, and respect the server's `Retry-After` header.
- **Retry budget.** Retries multiply traffic when a service is already struggling (a retry storm). Limit retries to a small share of all requests, and retry at only one layer of the call chain.
- **Idempotency keys.** For writes with side effects (payments, orders), the client creates a unique key before the first attempt and sends the same key on every retry. The server saves the key in the same transaction as the change itself. If the key comes again, it returns the saved result and does nothing new.
- **Circuit breaker.** It watches calls to one dependency and has three states. **Closed:** calls pass and failures are counted. **Open:** after too many failures or timeouts, calls fail fast without waiting. **Half-open:** after a pause, a few test calls go through; if they succeed, the breaker closes again. Return a fallback while the breaker is open.
- **Load shedding.** When your own service is overloaded, reject part of the requests early with `503` or `429`. This is better than letting queues grow until everything times out.

:::tip[In the interview]
When the interviewer asks "what if this call fails?", answer with the chain: "a deadline, a few retries with exponential backoff and jitter, an idempotency key so retries are safe, and a circuit breaker so failures do not cascade".
:::

## Cheat sheet

- Reuse connections. A new HTTPS connection over HTTP/1.1 or HTTP/2 = DNS → TCP → TLS → HTTP, several round trips.
- Low DNS TTL = fast failover; high TTL = fewer lookups.
- TCP by default. Build on UDP yourself only when late data is useless (live media, games).
- REST by default, at the edge. gRPC between your own services when speed, payload size, or streaming matter. GraphQL when many clients need different data.
- POST is not idempotent. Add an idempotency key before you retry it.
- Server push: polling → long polling → SSE → WebSocket. Pick the simplest that works; SSE is the default for real push.
- WebSocket: no caching, plan for reconnects with jitter, sequence numbers, and pub/sub between servers.
- WebRTC needs signaling, STUN, and TURN; group calls go through a media server.
- Stateless servers behind an L7 load balancer, round robin, health checks.
- Long-lived connections: least connections, idle timeout above the heartbeat interval, no buffering for SSE. L4 for non-HTTP or TLS passthrough.
- Routing by key only for per-key local state; use consistent hashing.
- CDN for static content; nearest region for APIs; keep data near its users.
- Every remote call has a deadline. Retry only temporary failures of safe operations, with backoff and jitter. Writes get an idempotency key created before the first try. Circuit breaker for failing dependencies.
- Keep a retry budget and retry at one layer only. When overloaded, shed load with `503` or `429`.
