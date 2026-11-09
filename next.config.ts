import type { NextConfig } from "next";
import { apiContentSecurityPolicy, contentSecurityPolicy, contentSecurityPolicyHeaderName, staticSecurityHeaders } from "./src/lib/security-headers";
import { canonicalHostRedirects } from "./src/lib/site";

const nextConfig: NextConfig = {
  async redirects() {
    return canonicalHostRedirects;
  },
  async headers() {
    return [
      { source: "/:path*", headers: staticSecurityHeaders },
      { source: "/sdileni/:path*", headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Referrer-Policy", value: "no-referrer" }] },
      // Fail closed until the build finalizer installs exact hashes for these documents.
      ...["/", "/privacy", "/terms"].map(source => ({ source, headers: [{ key: contentSecurityPolicyHeaderName(process.env.CSP_REPORT_ONLY), value: contentSecurityPolicy({ development: process.env.NODE_ENV === "development" }) }] })),
      // Other pages get a per-request nonce policy from src/proxy.ts.
      { source: "/api/:path*", headers: [{ key: "Content-Security-Policy", value: apiContentSecurityPolicy }] },
    ];
  },
};

export default nextConfig;
