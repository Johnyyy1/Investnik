/** Finalize only immutable public HTML; never reuse these hashes for ISR or session pages. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getRouteCacheKey } from "next/dist/server/lib/route-cache-key";
import type { RouteKind } from "next/dist/server/route-kind";
import { contentSecurityPolicy, contentSecurityPolicyHeaderName } from "../src/lib/security-headers";

function assetPath(url: string) {
  assert.match(url, /^\/_next\/static\/[\w./-]+\.js(?:\?dpl=[\w-]+)?$/, "Only local build scripts may be hash-authorized");
  assert.ok(!url.includes(".."), "Asset traversal is forbidden");
  return url.split("?")[0];
}

const digest = (content: string | Buffer) => `sha256-${createHash("sha256").update(content).digest("base64")}`;

export async function hashDocument(html: string, loadAsset: (url: string) => Promise<Buffer>) {
  const hashes = new Set<string>();
  // Next emits quoted attributes and literal closing script tags. Fail on unexpected sources.
  const tags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  assert.ok(tags.length, "Static HTML must contain Next bootstrap scripts");
  for (const [tag, attributes, body] of tags) {
    assert.ok(!/\bnonce=/.test(attributes), "Static HTML must never contain a nonce");
    const src = attributes.match(/\bsrc="([^"]+)"/);
    if (src) {
      const hash = digest(await loadAsset(assetPath(src[1])));
      hashes.add(hash);
      const cleanTag = tag.replace(/ integrity="[^"]*"/g, "");
      html = html.replace(tag, cleanTag.replace("<script", `<script integrity="${hash}"`));
    } else {
      hashes.add(digest(body));
    }
  }
  // Script preloads undergo the same CSP check as their eventual script element.
  for (const [tag, url] of html.matchAll(/<link\b[^>]*\bas="script"[^>]*\bhref="([^"]+)"[^>]*>/g)) {
    const hash = digest(await loadAsset(assetPath(url)));
    hashes.add(hash);
    const cleanTag = tag.replace(/ integrity="[^"]*"/g, "");
    html = html.replace(tag, cleanTag.replace("<link", `<link integrity="${hash}"`));
  }
  return { html, hashes: [...hashes] };
}

export async function finalizeStaticCsp(dist = ".next") {
  const manifestPath = resolve(dist, "routes-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(manifest.version, 3, "Review CSP finalization when Next changes manifest format");
  const prerender = JSON.parse(await readFile(resolve(dist, "prerender-manifest.json"), "utf8"));
  const appRoutes: Record<string, string> = JSON.parse(await readFile(resolve(dist, "app-path-routes-manifest.json"), "utf8"));
  for (const route of ["/", "/privacy", "/terms"]) {
    assert.equal(prerender.routes[route]?.initialRevalidateSeconds, false, `${route} must be immutable static HTML`);
    const sources = Object.entries(appRoutes).filter(([source, pathname]) => pathname === route && source.endsWith("/page"));
    assert.equal(sources.length, 1, `Expected one App Page source for ${route}`);
    const scopedKey = getRouteCacheKey(route, { kind: "APP_PAGE" as RouteKind.APP_PAGE, sourceRoute: sources[0][0] });
    // Adapters emit scoped artifacts; standalone Next builds may also retain the public seed.
    const candidates = [resolve(dist, `server/app/${route === "/" ? "index" : route.slice(1)}.html`), resolve(dist, `server${scopedKey}.html`)];
    const documents = (await Promise.all(candidates.map(async path => {
      try { return { path, html: await readFile(path, "utf8") }; }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw error;
      }
    }))).filter(document => document !== null);
    assert.ok(documents.length, `Missing prerendered HTML for ${route}`);
    assert.ok(documents.every(document => document.html === documents[0].html), `Conflicting prerendered HTML for ${route}`);
    const result = await hashDocument(documents[0].html, url => readFile(resolve(dist, url.slice("/_next/".length))));
    const rule = manifest.headers.find((rule: { source: string }) => rule.source === route);
    assert.ok(rule, `Missing fail-closed CSP rule for ${route}`);
    rule.headers = [{ key: contentSecurityPolicyHeaderName(process.env.CSP_REPORT_ONLY), value: contentSecurityPolicy({ hashes: result.hashes, development: false }) }];
    for (const document of documents) await writeFile(document.path, result.html);
    console.log(`Static CSP: ${route} (${result.hashes.length} script hashes)`);
  }
  // Next start and Vercel's Next builder both consume custom headers from this manifest.
  await writeFile(manifestPath, JSON.stringify(manifest));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await finalizeStaticCsp();
