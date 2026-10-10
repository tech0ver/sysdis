# ARTICLES.md

The map of articles on this site: written and planned. Use it to decide which article a topic belongs to and to link articles to each other.

An article covers its own topic in depth. When another article needs that topic, it says one line about it and links here instead of explaining it again.

## Links to articles that do not exist yet

Put a hidden marker where the link should go. The marker is an HTML comment, so the site does not show it:

```md
Real-time systems route messages between servers for this. <!-- link: patterns/real-time -->
```

The value is the page path under `src/content/docs/`, without the extension. Use the paths from this file.

When you write an article, find the markers that point to it and turn them into relative links:

```sh
grep -rn "link: patterns/real-time" src/content/docs
```

Then add links from the new article to the existing ones, and update `readMore` in the glossary for the terms the new article explains.

## Fundamentals

- `fundamentals/networking` — How components talk over a network: client and server, IP and DNS, TCP and UDP, TLS, HTTP, pushing updates, load balancing, stateless servers, regions and CDN, failed calls.
- `fundamentals/latency-numbers` — The numbers to remember: round trips inside a data center and across continents, memory, disk, network.
- `fundamentals/caching` — Where to cache, HTTP caching (Cache-Control, ETag), invalidation.
- `fundamentals/security` — Authentication and authorization, CORS, cookies, mTLS, where to end TLS.
- `fundamentals/replication` — Copies of data across nodes and regions, leaders and followers, consistency, stale reads.
- `fundamentals/sharding` — Splitting data across nodes, consistent hashing.

## Patterns

- `patterns/resilience` — Circuit breaker, bulkhead, retry budget, load shedding, cascading failures, idempotency.
- `patterns/rate-limiting` — Limiting algorithms, limits across many servers, the "design a rate limiter" task.
- `patterns/real-time` — Long-lived connections at scale: routing messages between servers, reconnect and replay, heartbeats, slow clients, presence.
- `patterns/api-gateway` — One entry point for clients: API gateway, BFF, auth, routing, response composition.
- `patterns/service-discovery` — Service registry, client-side load balancing, service mesh.
- `patterns/async-messaging` — Queues, 202 Accepted, background work.

## Technologies

- `technologies/api-styles` — REST, gRPC, GraphQL; HTTP methods, status codes, idempotent methods.
- `technologies/load-balancers` — Forward and reverse proxies, balancing algorithms in depth, sticky sessions, hash routing, connection draining; NGINX, Envoy, HAProxy.
- `technologies/cdn` — How a CDN works, anycast routing to a nearby edge, what to cache on it, invalidation.
- `technologies/webrtc` — How WebRTC connects peers: NAT, STUN, TURN, signaling.
