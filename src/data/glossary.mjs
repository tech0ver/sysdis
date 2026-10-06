// The site glossary. One entry per term.
//
// - `term`: the name shown in the glossary. Keep the official spelling of names and
//   abbreviations (OpenAPI, GraphQL, gRPC, TCP). Start common words with a capital letter
//   (Failover, Exponential backoff).
// - `aliases`: exact spellings to find in articles (case-sensitive). Defaults to [term] plus
//   the same with a lowercase first letter, so "Failover" also finds "failover".
// - `expansion`: what an abbreviation stands for. Only for abbreviations.
// - `short`: one sentence that fits any context. Shown in the tooltip.
// - `explanation`: two or three sentences: what it is and why it matters in a design.
// - `readMore`: where to read more. `href` is a site path (no leading slash, may have `#anchor`)
//   or a full external URL. A page that is the `readMore` of a term explains it in its own text,
//   so the term gets no tooltip on that page.
//
// Write in simple English. Keep `short` and `explanation` true in any context.

const networking = (anchor, section) => ({
	href: `fundamentals/networking/#${anchor}`,
	label: `Networking: ${section}`,
});

/** @type {Array<{id: string, term: string, aliases?: string[], expansion?: string, short: string, explanation: string, readMore?: {href: string, label: string}}>} */
export const glossary = [
	{
		id: 'api',
		term: 'API',
		expansion: 'Application Programming Interface',
		short: 'A contract that lets one program use another program.',
		explanation:
			'An API says which requests a program accepts and what it returns. In system design, it usually means the network endpoints that clients and other services call.',
		readMore: { href: 'https://en.wikipedia.org/wiki/API', label: 'Wikipedia: API' },
	},
	{
		id: 'http',
		term: 'HTTP',
		expansion: 'Hypertext Transfer Protocol',
		short: 'The request-response protocol of the web.',
		explanation:
			'A client sends a request with a method (GET, POST, …), a path, and headers. The server sends back a status code, headers, and a body. Most public APIs run on HTTP.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview', label: 'MDN: An overview of HTTP' },
	},
	{
		id: 'https',
		term: 'HTTPS',
		expansion: 'HTTP Secure',
		short: 'HTTP sent over an encrypted TLS connection.',
		explanation:
			'HTTPS is the same HTTP, but TLS encrypts it and proves the server is who it claims to be. Today almost all web traffic uses HTTPS.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Glossary/HTTPS', label: 'MDN: HTTPS' },
	},
	{
		id: 'http-2',
		term: 'HTTP/2',
		short: 'A newer version of HTTP that sends many requests over one connection at the same time.',
		explanation:
			'HTTP/2 splits requests into streams on one TCP connection and compresses headers. A lost TCP packet still stops all streams until it is resent.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Glossary/HTTP_2', label: 'MDN: HTTP/2' },
	},
	{
		id: 'http-3',
		term: 'HTTP/3',
		short: 'The version of HTTP that runs on QUIC instead of TCP.',
		explanation:
			'HTTP/3 keeps the many-streams model of HTTP/2, but a lost packet blocks only its own stream. It also sets up connections faster.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Glossary/HTTP_3', label: 'MDN: HTTP/3' },
	},
	{
		id: 'dns',
		term: 'DNS',
		expansion: 'Domain Name System',
		short: 'The system that turns a domain name into an IP address.',
		explanation:
			'Before a client can connect to example.com, it asks DNS for the address. Answers are cached for the time set by their TTL. DNS can also spread users across servers or regions by returning different addresses.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Glossary/DNS', label: 'MDN: DNS' },
	},
	{
		id: 'ttl',
		term: 'TTL',
		expansion: 'Time To Live',
		short: 'How long a piece of data stays valid before it must be refreshed or dropped.',
		explanation:
			'Caches, DNS answers, and network packets all use a TTL. A short TTL means fresher data but more work to refresh it. A long TTL means less work but older data.',
		readMore: { href: 'https://en.wikipedia.org/wiki/Time_to_live', label: 'Wikipedia: Time to live' },
	},
	{
		id: 'ip-address',
		term: 'IP address',
		aliases: ['IP address', 'IP addresses'],
		expansion: 'Internet Protocol address',
		short: 'The number that identifies a device on a network.',
		explanation:
			'Packets are sent to an IP address, the way letters are sent to a street address. DNS maps names to IP addresses.',
		readMore: { href: 'https://en.wikipedia.org/wiki/IP_address', label: 'Wikipedia: IP address' },
	},
	{
		id: 'tcp',
		term: 'TCP',
		expansion: 'Transmission Control Protocol',
		short: 'A transport protocol that delivers a reliable, ordered stream of bytes over a connection.',
		explanation:
			'TCP opens a connection with a handshake, numbers every byte, and resends what gets lost. This makes it reliable, but a lost packet delays all data after it. HTTP/1.1, HTTP/2, and most databases run on TCP.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Glossary/TCP', label: 'MDN: TCP' },
	},
	{
		id: 'three-way-handshake',
		term: 'Three-way handshake',
		short: 'The three messages that open a TCP connection.',
		explanation:
			'The client sends SYN (synchronize: "let\'s connect"), the server answers SYN-ACK ("got it, let\'s connect"), and the client sends ACK (acknowledge: "got it"). This costs one round trip before any data moves, which is one reason clients reuse connections.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Glossary/TCP_handshake', label: 'MDN: TCP handshake' },
	},
	{
		id: 'udp',
		term: 'UDP',
		expansion: 'User Datagram Protocol',
		short: 'A transport protocol that sends separate messages with no delivery or order guarantees.',
		explanation:
			'UDP has no connection and no resends, so it adds very little delay. The application must handle loss and order itself if it cares. Live audio, video, games, and QUIC use UDP.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Glossary/UDP', label: 'MDN: UDP' },
	},
	{
		id: 'quic',
		term: 'QUIC',
		short: 'A transport protocol on top of UDP that gives reliable streams with built-in encryption.',
		explanation:
			'QUIC does what TCP and TLS do together, but each stream recovers from loss on its own. HTTP/3 runs on QUIC.',
		readMore: { href: 'https://en.wikipedia.org/wiki/QUIC', label: 'Wikipedia: QUIC' },
	},
	{
		id: 'tls',
		term: 'TLS',
		expansion: 'Transport Layer Security',
		short: 'The protocol that encrypts a connection and proves the server is who it claims to be.',
		explanation:
			'During the TLS handshake, the client checks the server certificate and both sides agree on keys. After that, all data is encrypted. HTTPS is HTTP over TLS.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Glossary/TLS', label: 'MDN: TLS' },
	},
	{
		id: 'round-trip',
		term: 'Round trip',
		aliases: ['round trip', 'round trips', 'Round trip'],
		short: 'The time for a message to reach the other side and for the answer to come back.',
		explanation:
			'Also called RTT (round-trip time). Every handshake costs at least one round trip, so distance between client and server adds up fast.',
		readMore: networking('what-a-new-request-costs', 'What a new request costs'),
	},
	{
		id: 'keep-alive',
		term: 'Keep-alive',
		short: 'Keeping a connection open after a response, so the next request can reuse it.',
		explanation:
			'Reusing a connection skips the TCP and TLS handshakes. Clients and servers close idle connections after a timeout.',
		readMore: { href: 'https://en.wikipedia.org/wiki/HTTP_persistent_connection', label: 'Wikipedia: HTTP persistent connection' },
	},
	{
		id: 'connection-pool',
		term: 'Connection pool',
		aliases: ['connection pool', 'connection pools'],
		short: 'A set of open connections that a client keeps and reuses.',
		explanation:
			'Opening a connection is slow, so services keep a pool of them to databases and other services. The pool size also limits how much load one client can put on a server.',
		readMore: { href: 'https://en.wikipedia.org/wiki/Connection_pool', label: 'Wikipedia: Connection pool' },
	},
	{
		id: 'failover',
		term: 'Failover',
		short: 'Switching to a backup when the main server or system fails.',
		explanation:
			'Failover can be automatic or manual. How fast it works depends on how quickly the failure is detected and how quickly clients learn the new address.',
		readMore: { href: 'https://en.wikipedia.org/wiki/Failover', label: 'Wikipedia: Failover' },
	},
	{
		id: 'rest',
		term: 'REST',
		expansion: 'Representational State Transfer',
		short: 'An API style built on resources (URLs) and standard HTTP methods.',
		explanation:
			'Each thing is a resource with a URL, such as /orders/42. Clients read and change it with GET, POST, PUT, and DELETE. REST is the default style for public APIs.',
		readMore: networking('api-protocol-rest-grpc-or-graphql', 'API protocol'),
	},
	{
		id: 'grpc',
		term: 'gRPC',
		short: 'A framework for calling functions on another service, with binary messages over HTTP/2.',
		explanation:
			'You describe the calls in a .proto file and generate client and server code from it. Messages are small and fast to parse. It is common for service-to-service calls, but browsers cannot call it directly.',
		readMore: networking('api-protocol-rest-grpc-or-graphql', 'API protocol'),
	},
	{
		id: 'graphql',
		term: 'GraphQL',
		short: 'An API style where the client sends a query that names exactly the fields it needs.',
		explanation:
			'There is usually one endpoint, and the response has the shape of the query. It avoids over-fetching and many round trips, but caching and rate limiting are harder.',
		readMore: networking('api-protocol-rest-grpc-or-graphql', 'API protocol'),
	},
	{
		id: 'json',
		term: 'JSON',
		expansion: 'JavaScript Object Notation',
		short: 'A text format for data made of objects, arrays, strings, and numbers.',
		explanation: 'JSON is easy for people and programs to read, so most REST APIs use it. It is larger and slower to parse than binary formats.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Glossary/JSON', label: 'MDN: JSON' },
	},
	{
		id: 'protocol-buffers',
		term: 'Protocol Buffers',
		short: 'A binary data format with a schema, made by Google.',
		explanation:
			'You define messages in a .proto file and generate code from it. The binary form is smaller and faster to parse than JSON. gRPC uses it.',
		readMore: { href: 'https://protobuf.dev/overview/', label: 'protobuf.dev: Overview' },
	},
	{
		id: 'openapi',
		term: 'OpenAPI',
		short: 'A standard format for describing an HTTP API in a file.',
		explanation:
			'The file lists endpoints, parameters, and response shapes. Tools use it to build documentation, client code, and tests.',
		readMore: { href: 'https://www.openapis.org/what-is-openapi', label: 'OpenAPI Initiative: What is OpenAPI' },
	},
	{
		id: 'http-trailers',
		term: 'HTTP trailers',
		short: 'HTTP headers sent after the response body instead of before it.',
		explanation:
			'Trailers carry information that is known only at the end, such as a final status. gRPC uses them, and browser fetch cannot read them.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Trailer', label: 'MDN: Trailer' },
	},
	{
		id: 'grpc-web',
		term: 'gRPC-Web',
		short: 'A version of gRPC that browsers can use through a proxy.',
		explanation: 'The browser sends gRPC-Web requests, and a proxy turns them into normal gRPC calls to the backend.',
		readMore: { href: 'https://github.com/grpc/grpc-web', label: 'GitHub: grpc-web' },
	},
	{
		id: 'n-plus-one',
		term: 'N+1 problem',
		short: 'Running one extra query for each item in a list, instead of one query for all of them.',
		explanation:
			'Loading 100 orders and then their users one by one makes 101 queries. Batch the lookups (for example with a data loader) to make it two.',
		readMore: { href: 'https://graphql.org/learn/performance/', label: 'graphql.org: Performance' },
	},
	{
		id: 'persisted-queries',
		term: 'Persisted queries',
		short: 'GraphQL queries stored on the server in advance, so the client sends only an ID.',
		explanation:
			'Requests become small and can be sent as GET, so HTTP caches and CDNs can store the responses. The server can also refuse any query it does not know.',
		readMore: { href: 'https://www.apollographql.com/docs/apollo-server/performance/apq', label: 'Apollo: Automatic persisted queries' },
	},
	{
		id: 'rate-limit',
		term: 'Rate limit',
		aliases: ['rate limit', 'rate limits', 'Rate limits'],
		short: 'A cap on how many requests a client may send in a period of time.',
		explanation: 'Rate limits protect a service from overload and abuse. Requests over the limit usually get HTTP 429.',
		readMore: { href: 'https://en.wikipedia.org/wiki/Rate_limiting', label: 'Wikipedia: Rate limiting' },
	},
	{
		id: 'idempotent',
		term: 'Idempotent',
		aliases: ['idempotent', 'Idempotent'],
		short: 'An operation is idempotent if doing it twice leaves the same result as doing it once.',
		explanation:
			'Idempotent operations are safe to retry. In HTTP, GET, PUT, and DELETE are idempotent and POST is not.',
		readMore: networking('http-details-that-change-the-design', 'HTTP details that change the design'),
	},
	{
		id: 'idempotency-key',
		term: 'Idempotency key',
		aliases: ['idempotency key', 'idempotency keys', 'Idempotency keys'],
		short: 'A unique ID the client attaches to a request, so the server can recognize a retry of it.',
		explanation:
			'If the same key comes again, the server returns the saved result instead of doing the work twice. Used for payments and orders.',
		readMore: networking('when-a-call-fails', 'When a call fails'),
	},
	{
		id: 'etag',
		term: 'ETag',
		short: 'An HTTP header with a version tag of a response.',
		explanation:
			'The client sends the tag back to ask "has it changed?". If not, the server answers 304 Not Modified with no body.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag', label: 'MDN: ETag' },
	},
	{
		id: 'polling',
		term: 'Polling',
		short: 'The client asks the server for new data again and again on a timer.',
		explanation: 'Polling is simple and works everywhere. The cost is delay (up to one interval) and many empty requests.',
		readMore: networking('pushing-updates-to-clients', 'Pushing updates to clients'),
	},
	{
		id: 'long-polling',
		term: 'Long polling',
		aliases: ['long polling', 'Long polling'],
		short: 'The server holds a request open until it has new data or a timeout, then the client asks again.',
		explanation: 'Long polling gives near real-time updates over plain HTTP, without new infrastructure.',
		readMore: networking('pushing-updates-to-clients', 'Pushing updates to clients'),
	},
	{
		id: 'sse',
		term: 'SSE',
		expansion: 'Server-Sent Events',
		short: 'A long HTTP response through which the server streams text events to the browser.',
		explanation:
			'The browser reconnects by itself and tells the server the last event it got. SSE sends data only from server to client.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events', label: 'MDN: Server-sent events' },
	},
	{
		id: 'websocket',
		term: 'WebSocket',
		aliases: ['WebSockets', 'WebSocket'],
		short: 'A long-lived connection where client and server can both send messages at any time.',
		explanation:
			'It starts as an HTTP request and then upgrades to a two-way channel on the same TCP connection. Used for chat, collaboration, and games.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API', label: 'MDN: WebSockets API' },
	},
	{
		id: 'webrtc',
		term: 'WebRTC',
		expansion: 'Web Real-Time Communication',
		short: 'A browser technology for direct peer-to-peer audio, video, and data.',
		explanation:
			'Peers connect to each other over UDP when they can. A signaling server, STUN, and TURN help them find each other through NAT.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API', label: 'MDN: WebRTC API' },
	},
	{
		id: 'nat',
		term: 'NAT',
		expansion: 'Network Address Translation',
		short: 'A router feature that lets many devices share one public IP address.',
		explanation:
			'The router rewrites addresses on the way out and remembers the mapping for replies. New connections from outside usually cannot reach a device behind NAT.',
		readMore: { href: 'https://en.wikipedia.org/wiki/Network_address_translation', label: 'Wikipedia: Network address translation' },
	},
	{
		id: 'stun',
		term: 'STUN',
		expansion: 'Session Traversal Utilities for NAT',
		short: 'A server that tells a device its public IP address and port.',
		explanation: 'Peers behind NAT use STUN to learn how others can reach them, so they can try a direct connection.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols', label: 'MDN: WebRTC protocols' },
	},
	{
		id: 'turn',
		term: 'TURN',
		expansion: 'Traversal Using Relays around NAT',
		short: 'A relay server that forwards traffic between peers when they cannot connect directly.',
		explanation: 'TURN always works, but all media goes through your server, so it costs bandwidth.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols', label: 'MDN: WebRTC protocols' },
	},
	{
		id: 'signaling-server',
		term: 'Signaling server',
		short: 'A server that passes connection details between peers before they connect directly.',
		explanation: 'WebRTC does not define how signaling works. Apps often use WebSocket for it.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling', label: 'MDN: Signaling and video calling' },
	},
	{
		id: 'llm',
		term: 'LLM',
		expansion: 'Large Language Model',
		short: 'An AI model that reads and writes text.',
		explanation: 'LLM APIs often stream the answer token by token, which fits SSE well.',
		readMore: { href: 'https://en.wikipedia.org/wiki/Large_language_model', label: 'Wikipedia: Large language model' },
	},
	{
		id: 'pub-sub',
		term: 'Pub/sub',
		expansion: 'publish-subscribe',
		short: 'A messaging pattern where publishers send messages to a channel and every subscriber gets a copy.',
		explanation:
			'Publishers do not know who the subscribers are. It is used to fan out events, for example from one service to all WebSocket servers.',
		readMore: { href: 'https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern', label: 'Wikipedia: Publish-subscribe pattern' },
	},
	{
		id: 'redis',
		term: 'Redis',
		short: 'A fast in-memory data store, often used as a cache, a queue, or for pub/sub.',
		explanation: 'Redis keeps data in memory, so reads and writes take well under a millisecond inside a data center.',
		readMore: { href: 'https://redis.io/docs/latest/', label: 'Redis docs' },
	},
	{
		id: 'heartbeat',
		term: 'Heartbeat',
		aliases: ['heartbeat', 'heartbeats', 'Heartbeats'],
		short: 'A small message sent on a timer to show a connection or process is still alive.',
		explanation: 'If heartbeats stop, the other side treats the peer as dead. They also stop proxies from closing idle connections.',
		readMore: networking('running-long-lived-connections-at-scale', 'Running long-lived connections at scale'),
	},
	{
		id: 'backpressure',
		term: 'Backpressure',
		short: 'What happens when a receiver cannot keep up and data piles up on the way to it.',
		explanation: 'A system handles backpressure by slowing the sender, buffering a bounded amount, or dropping data.',
		readMore: networking('running-long-lived-connections-at-scale', 'Running long-lived connections at scale'),
	},
	{
		id: 'load-balancer',
		term: 'Load balancer',
		aliases: ['load balancer', 'load balancers'],
		short: 'A component that spreads incoming traffic across several servers.',
		explanation: 'It also stops sending traffic to servers that fail health checks, so clients see one stable address.',
		readMore: networking('load-balancing', 'Load balancing'),
	},
	{
		id: 'l4-l7',
		term: 'L4 / L7',
		aliases: ['L4', 'L7'],
		short: 'Network layers: L4 is the transport layer (TCP, UDP), L7 is the application layer (HTTP).',
		explanation: 'An L4 load balancer routes connections. An L7 load balancer reads each HTTP request and can route by path or header.',
		readMore: networking('l4-or-l7', 'L4 or L7'),
	},
	{
		id: 'tls-termination',
		term: 'TLS termination',
		short: 'Decrypting TLS traffic at a load balancer or proxy instead of at the backend.',
		explanation: 'The load balancer can then read and route HTTP. Traffic to the backend is either plain or encrypted again.',
		readMore: networking('l4-or-l7', 'L4 or L7'),
	},
	{
		id: 'round-robin',
		term: 'Round robin',
		aliases: ['round robin', 'Round robin'],
		short: 'Sending each new request to the next server in turn.',
		explanation: 'Round robin is simple and works well when requests cost about the same.',
		readMore: networking('algorithms', 'Algorithms'),
	},
	{
		id: 'least-connections',
		term: 'Least connections',
		aliases: ['least connections', 'Least connections'],
		short: 'Sending each new connection to the server with the fewest open connections.',
		explanation: 'Good for long-lived connections such as WebSockets, where round robin can leave some servers overloaded.',
		readMore: networking('algorithms', 'Algorithms'),
	},
	{
		id: 'consistent-hashing',
		term: 'Consistent hashing',
		short: 'A way to map keys to servers so that adding or removing a server moves only a few keys.',
		explanation:
			'With plain hash mod N, changing N moves most keys. Consistent hashing places keys and servers on a ring, so a change touches only its neighbors. Used for sharding and per-key routing.',
		readMore: { href: 'https://en.wikipedia.org/wiki/Consistent_hashing', label: 'Wikipedia: Consistent hashing' },
	},
	{
		id: 'health-check',
		term: 'Health check',
		aliases: ['health check', 'health checks', 'Health checks'],
		short: 'A regular probe that tells whether a server can take traffic.',
		explanation: 'Load balancers remove servers that fail several checks in a row and add them back after several successes.',
		readMore: networking('keeping-it-available', 'Keeping it available'),
	},
	{
		id: 'connection-draining',
		term: 'Connection draining',
		aliases: ['connection draining', 'Connection draining'],
		short: 'Letting a server finish its current requests before it is removed.',
		explanation: 'The load balancer stops sending new work to the server, then removes it once current work is done or a timeout passes.',
		readMore: networking('keeping-it-available', 'Keeping it available'),
	},
	{
		id: 'sticky-sessions',
		term: 'Sticky sessions',
		aliases: ['sticky sessions', 'Sticky sessions'],
		short: 'Sending all requests from one client to the same server.',
		explanation: 'It keeps server-local state usable, but makes failover and rebalancing harder.',
		readMore: networking('keeping-it-available', 'Keeping it available'),
	},
	{
		id: 'service-discovery',
		term: 'Service discovery',
		short: 'A way for services to find the current addresses of other services.',
		explanation: 'Instances register themselves, and clients ask the registry for healthy instances. Used with client-side load balancing.',
		readMore: { href: 'https://en.wikipedia.org/wiki/Service_discovery', label: 'Wikipedia: Service discovery' },
	},
	{
		id: 'cdn',
		term: 'CDN',
		expansion: 'Content Delivery Network',
		short: 'A network of servers around the world that cache content close to users.',
		explanation: 'A CDN cuts latency for users and load on your servers. It suits static files and responses that many users read.',
		readMore: { href: 'https://developer.mozilla.org/en-US/docs/Glossary/CDN', label: 'MDN: CDN' },
	},
	{
		id: 'deadline',
		term: 'Deadline',
		aliases: ['deadline', 'deadlines'],
		short: 'The latest time by which a whole request must finish.',
		explanation: 'Each service passes the remaining time to the services it calls, so no one keeps working on a request the user already gave up on.',
		readMore: networking('when-a-call-fails', 'When a call fails'),
	},
	{
		id: 'exponential-backoff',
		term: 'Exponential backoff',
		short: 'Waiting longer after each failed try, for example 100 ms, 200 ms, 400 ms.',
		explanation: 'It gives a struggling service time to recover. Combine it with jitter and a cap on tries.',
		readMore: networking('when-a-call-fails', 'When a call fails'),
	},
	{
		id: 'jitter',
		term: 'Jitter',
		short: 'A random extra wait added before a retry.',
		explanation: 'Without jitter, many clients retry at the same moment and overload the service again.',
		readMore: networking('when-a-call-fails', 'When a call fails'),
	},
	{
		id: 'circuit-breaker',
		term: 'Circuit breaker',
		aliases: ['circuit breaker', 'Circuit breaker'],
		short: 'A guard that stops calls to a failing dependency for a while and fails fast instead.',
		explanation: 'It has three states: closed (calls pass), open (calls fail fast), and half-open (a few test calls). It keeps one failure from spreading.',
		readMore: networking('when-a-call-fails', 'When a call fails'),
	},
	{
		id: 'load-shedding',
		term: 'Load shedding',
		aliases: ['load shedding', 'Load shedding', 'shed load'],
		short: 'Rejecting part of the requests on purpose when a service is overloaded.',
		explanation: 'Fast rejections keep the service working for the rest of the traffic, instead of slowing down for everyone.',
		readMore: networking('when-a-call-fails', 'When a call fails'),
	},
];
