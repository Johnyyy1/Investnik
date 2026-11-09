# Static public documents and CSP (#406)

`/`, `/privacy` and `/terms` use immutable prerendered HTML. Their `dynamic = "error"`
exports reject request-time dependencies. All other document route groups retain
request-time rendering and the existing fresh nonce policy. Development keeps
nonce CSP on public documents too.

Run `npm run build`, including on Vercel. It runs Next and then
`scripts/static-csp.mts`. The finalizer asserts immutable prerender entries, hashes
exact inline script bytes and local external script files, and adds integrity
attributes to scripts and script preloads. It replaces the fail-closed public CSP
rules in `.next/routes-manifest.json`, consumed by Next start and Vercel's Next
builder. Deployment-versioned `?dpl=` URLs retain their query while hashing the local asset.
HTML is located through the App route manifest and Next response-cache keys, covering
standalone seed files and scoped adapter artifacts. If both exist, they must match.
No source hashes or generated assets are committed. Do not deploy a bare
`next build` output: its public policies intentionally block bootstrap scripts.

Security review: the public policy preserves `strict-dynamic`, object, frame,
base, form and connection restrictions. It permits neither inline script nor eval
exceptions. Only exact build script bytes bootstrap trust; same-origin arbitrary
script URLs are not trusted by CSP3 browsers. JSON-LD is escaped as before. Auth,
session, API, financial data and persistence contracts are unchanged. Personalization
invalidates only the app and onboarding layouts; invalidating the root layout would regenerate public HTML without its build-time integrity attributes.
Hashes must never be reused for ISR, personalized HTML or runtime-injected scripts. The
finalizer rejects nonces, unknown script sources, traversal and changed manifest
versions. Next upgrades require reviewing this build artifact integration.

References: [MDN hash and strict-dynamic semantics](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP),
[Next CSP and SRI limitations](https://nextjs.org/docs/app/guides/content-security-policy).
SRI alone does not authorize Next's inline Flight scripts, so both inline and
external script hashes are necessary.

Validation: `npm test`, `npm run build`, then on a fresh production server run
`STATIC_CSP_TEST_URL=http://localhost:<port> npm run test:static-csp-browser` and
`MARKETING_TEST_URL=http://localhost:<port> npm run test:marketing-browser` with
an isolated local QA database. The CSP browser check verifies no load violations,
blocked injected inline execution, public cache headers and fresh auth nonces.
The marketing suite checks hydration, navigation, analytics/demo behavior,
responsive layout, keyboard behavior and persisted-state isolation.

Before deployment approval, verify repeated requests to all three Vercel preview
paths carry the generated CSP and `x-vercel-cache: HIT`; repeat on production
after merge. Run the five-before/five-after mobile Lighthouse comparison from
`performance-baseline.md`. Local Next cache hits establish prerendering but do
not prove Vercel edge behavior or latency from the Czech Republic.
