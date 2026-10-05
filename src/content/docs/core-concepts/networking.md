---
title: Networking
description: The networking choices you make in a system design interview — protocols, real-time updates, load balancing, and failure handling.
---

Every design has boxes connected by arrows. Each arrow is a network call, and each call needs a protocol. It can also be slow or fail. This page covers the choices you make for those arrows: which protocol to use, how to push updates to clients, how to spread traffic, and how to survive failures.

## What happens in one request

For HTTPS over HTTP/1.1 or HTTP/2, a new request goes through four steps:

1. **DNS** — turns the domain name into an IP address. Answers are cached for a time set by the TTL (time to live).
2. **TCP** — opens a connection with a three-way handshake (SYN, SYN-ACK, ACK).
3. **TLS** — checks the server certificate and agrees on keys for encryption.
4. **HTTP** — sends the request and gets the response.

Steps 1–3 cost round trips before any data moves. This is why clients reuse connections, and why a server far from the user feels slow.

:::tip[In the interview]
You rarely need to draw this. Use it to explain latency: "A new connection costs several round trips, so we keep connections open and put servers close to users."
:::

DNS TTL is a trade-off. A low TTL lets you move traffic fast in a failover. A high TTL means fewer lookups, but clients keep using an old IP address for longer.

## TCP or UDP

**Default: TCP.** Almost everything you design runs on it: HTTP, gRPC, WebSockets, database connections.

| | TCP | UDP |
|---|---|---|
| Connection | Handshake first | None |
| Delivery | Guaranteed, retransmits lost data | Best effort, data can be lost |
| Order | In order | No order |
| Data unit | Byte stream, no message boundaries | Separate datagrams, boundaries kept |
| Overhead | Higher | Lower |

**Pick UDP** when fresh data is worth more than lost data: live video and audio calls, game state, metrics that are sent every second anyway. A late packet is useless there, so retransmitting it only adds delay.

With UDP, the application must handle loss, order, and duplicates itself if it cares about them.

:::note
HTTP/3 runs on QUIC, which runs on UDP. You get reliability without TCP's head-of-line blocking. You do not need to explain QUIC in an interview unless they ask.
:::

## API protocols: REST, gRPC, GraphQL

**Default: REST over HTTP** for public APIs and most service-to-service calls. Everyone knows it, every tool supports it, and HTTP caching works with it.

| | REST | gRPC | GraphQL |
|---|---|---|---|
| Format | JSON over HTTP | Protocol Buffers (binary) over HTTP/2 | JSON over HTTP, one endpoint |
| Contract | Resources and methods | Strict schema, generated clients | Schema, client picks fields |
| Best for | Public APIs, simple CRUD | Internal high-throughput calls | Many clients needing different data |
| Weak side | Over-fetching, many round trips | Poor browser support, harder to debug | Harder caching, complex server |

**Pick gRPC** for internal service-to-service traffic when speed and payload size matter. Keep REST at the edge for browsers and partners.

**Pick GraphQL** when many client types (web, mobile, partners) need different shapes of the same data, and over-fetching becomes a real problem.

### HTTP details that change designs

- **Idempotent methods.** GET, PUT, and DELETE can be repeated and leave the same final state. POST cannot. Retrying a POST can create a duplicate, so it needs an idempotency key (see [Failures](#failures-timeouts-retries-idempotency)).
- **Status codes.** 201 means created. 202 means accepted, work will happen later — the signal for async processing. 401 means "who are you?", 403 means "I know you, but no".
- **Statelessness.** HTTP does not remember the client between requests. Keep sessions in a shared store (or a signed token), not in one server's memory. Then any server can handle any request.
- **Caching headers.** `Cache-Control` sets how long a response stays fresh. `ETag` lets the client ask "has it changed?" and get a short `304 Not Modified` instead of the full body.
- **HTTP/2 and HTTP/3.** HTTP/2 sends many requests over one connection at the same time. HTTP/3 does the same over QUIC, so one lost packet does not block other requests.

:::tip[In the interview]
Say "REST by default" and move on. Spend time on the API shape — resources, methods, pagination, idempotency — not on the protocol.
:::

## Real-time updates

When the server must tell the client about new data, choose from the simplest option up.

| Option | How it works | Direction | Pick it when |
|---|---|---|---|
| Polling | Client asks every N seconds | Client → server | Updates are rare, delay of N seconds is fine |
| Long polling | Server holds the request until there is data or a timeout | Server → client | Simple push without new infrastructure |
| SSE (Server-Sent Events) | One long HTTP response that streams events | Server → client | Feeds, notifications, live scores, LLM token streams |
| WebSocket | HTTP upgrade to a full-duplex connection | Both ways | Chat, collaboration, multiplayer, high-frequency messages both ways |
| WebRTC | Direct peer-to-peer connection, usually over UDP | Peer ↔ peer | Video and audio calls |

**Default: SSE** if only the server pushes. **WebSocket** if the client also sends often.

Long-lived connections bring their own problems:

- **Sticky to one server.** A WebSocket stays on the server that accepted it. If that server dies, the client must reconnect, maybe to another server.
- **Shared state.** Keep important state outside the connection server (in a database, cache, or pub/sub), so any server can continue after a reconnect.
- **Routing messages.** To reach user B, you must know which server holds B's connection. A common answer: connection servers subscribe to a pub/sub channel (for example Redis) and forward messages to their own clients.
- **Missed messages.** A reconnect does not bring back what was sent during the gap. Use message IDs or sequence numbers so the client can ask for what it missed.
- **Heartbeats.** Send pings to find dead connections and to stop proxies from closing idle ones.
- **Slow clients.** A client that reads slower than you send creates backpressure. Use bounded buffers and decide what to drop or when to disconnect.

WebRTC needs a signaling server to connect the peers. Most users sit behind NAT (a router that hides their device's address), so peers need STUN to find their public address and a TURN relay when a direct connection fails.

:::tip[In the interview]
Do not reach for WebSockets by default. Say why you need two-way traffic. If you don't, SSE or long polling is simpler to scale.
:::

## Load balancing

When one server is not enough, add more servers and a load balancer in front of them. Servers must be **stateless** for this to work well: shared state goes to a database or cache, so any server can take any request.

### L4 or L7

| | L4 load balancer | L7 load balancer |
|---|---|---|
| Sees | IPs, ports, TCP connection | HTTP: host, path, headers, cookies |
| Routes by | Connection | Each request |
| Speed | Faster, simpler | Slower, more work per request |
| Can do | Forward long-lived connections | Path routing, TLS termination, auth, rate limits |
| Good for | WebSockets, raw TCP, very high throughput | Most web APIs, microservice routing |

**Default: L7** for HTTP APIs. **Pick L4** for long-lived connections like WebSockets, or when you need raw speed.

**TLS termination** means the load balancer decrypts HTTPS, so it can read and route HTTP. It can then send plain traffic to the backend or encrypt it again. **TLS passthrough** keeps traffic encrypted to the backend, but the load balancer can only route by connection.

### Algorithms

- **Round robin** — each server in turn. Good default when requests are similar.
- **Least connections** — the server with the fewest open connections. Good for long-lived connections or uneven request cost.
- **Weighted** — bigger servers get more traffic.
- **Hash-based** — the same key (user ID, IP) always goes to the same server. Use it when a server keeps per-key state, such as a local cache. Use [consistent hashing] so that adding a server moves only a few keys.

[consistent hashing]: https://en.wikipedia.org/wiki/Consistent_hashing

### Keeping it available

- **Health checks.** The load balancer probes each server and stops sending traffic to failing ones. Use thresholds (for example, 3 failures in a row) so one slow response does not remove a healthy server.
- **Connection draining.** Before removing a server, stop sending it new requests and let current ones finish.
- **No single point of failure.** Run more than one load balancer. DNS can return several load balancer IPs, but cached DNS answers make failover slower.
- **Client-side load balancing.** Inside a cluster, a client can pick a server itself using a list from service discovery. This removes one hop. gRPC clients often work this way.

:::tip[In the interview]
Draw one load balancer box, say "L7, round robin, health checks, stateless servers", and move on. Go deeper only if the system has long-lived connections or very uneven traffic.
:::

## Latency and regions

Distance costs time. A round trip across an ocean takes about 100–150 ms, and a new HTTPS connection needs several of them.

- **CDN (content delivery network).** Cache static content — images, video, JS, CSS — on servers near users. Also good for public API responses that many users read and that can be a little stale.
- **Regional deployment.** Run the service in several regions and send users to the nearest one (GeoDNS or anycast).
- **Data stays near its users.** Partition data by region when users mostly touch local data, for example riders and drivers in one city. Cross-region calls in the request path cancel the benefit.

:::tip[In the interview]
For global users, say "CDN for static content, nearest region for API calls". Then point out which data must be shared across regions — that is where consistency becomes hard.
:::

## Failures: timeouts, retries, idempotency

A network call is not a local function call. It can succeed, fail, or time out — and after a timeout you do not know if the other side did the work.

- **Timeouts.** Set one on every call. Without them, one slow dependency holds threads and connections until the whole service stops. Use a deadline for the full request and pass the remaining time to downstream calls.
- **Retries with exponential backoff and jitter.** Retry only temporary errors (timeouts, 503). Wait longer after each try (100 ms, 200 ms, 400 ms…) and add random jitter, so thousands of clients do not retry at the same moment. Limit the number of tries.
- **Idempotency.** A retry can repeat an action that already happened. For writes with side effects (payments, orders), the client sends an idempotency key. The server stores it and returns the saved result if the same key comes again.
- **Circuit breaker.** After many failures to one dependency, stop calling it for a while and fail fast or return a fallback. Then let a few test requests through. This stops one broken service from taking down its callers.

:::tip[In the interview]
When an interviewer asks "what if this call fails?", answer with the chain: "timeout, retry with exponential backoff and jitter, idempotency key so retries are safe, and a circuit breaker so failures do not cascade".
:::

## Cheat sheet

- New HTTPS request = DNS → TCP → TLS → HTTP. Reuse connections; put servers near users.
- TCP by default. UDP only when late data is useless (live media, games).
- REST by default. gRPC inside the cluster for speed. GraphQL when many clients need different data.
- POST is not idempotent — add an idempotency key before you retry it.
- Server push: polling → long polling → SSE → WebSocket. Pick the simplest that works.
- WebSockets: plan for reconnects, shared state, message routing between servers, missed messages.
- Stateless servers behind an L7 load balancer with health checks. L4 for long-lived connections.
- Hash-based routing only when servers keep per-key state; use consistent hashing.
- CDN for static content; nearest region for APIs; partition data by region when you can.
- Every network call: timeout, limited retries with backoff and jitter, idempotency, circuit breaker.
