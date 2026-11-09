import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { hashDocument, finalizeStaticCsp } from "../../scripts/static-csp.mjs";

it("pins exact inline bytes and external assets without trusting arbitrary same-origin scripts", async () => {
  const asset = Buffer.from("window.boot = true;");
  const hash = `sha256-${createHash("sha256").update(asset).digest("base64")}`;
  const result = await hashDocument('<link rel="preload" as="script" href="/_next/static/chunk.js"/><script src="/_next/static/chunk.js" async=""></script><script> self.__next_f=[]; </script>', async () => asset);
  expect(result.html.match(new RegExp(`integrity=`, "g"))).toHaveLength(2);
  expect(result.html).toContain(`integrity="${hash}"`);
  expect(result.hashes).toContain(hash);
  expect(result.hashes).toContain(`sha256-${createHash("sha256").update(" self.__next_f=[]; ").digest("base64")}`);
  expect(await hashDocument(result.html, async () => asset)).toEqual(result);
});

it("fails closed on nonces, unexpected sources and missing scripts", async () => {
  for (const html of ['<script nonce="fixed">boot()</script>', '<script src="https://evil.test/a.js"></script>', '<script src="/_next/static/../a.js"></script>', '<script src="/_next/static/test.js?other=untrusted"></script>', '<html></html>']) {
    await expect(hashDocument(html, async () => Buffer.from(""))).rejects.toThrow();
  }
});

it("hashes deployment-versioned Next assets by their local path while retaining the versioned URL", async () => {
  const loaded: string[] = [];
  const result = await hashDocument('<link as="script" href="/_next/static/test.js?dpl=dpl_test123"/><script src="/_next/static/test.js?dpl=dpl_test123"></script>', async path => {
    loaded.push(path);
    return Buffer.from("boot()");
  });
  expect(loaded).toEqual(["/_next/static/test.js", "/_next/static/test.js"]);
  expect(result.html).toContain('src="/_next/static/test.js?dpl=dpl_test123"');
  expect(result.html.match(/integrity=/g)).toHaveLength(2);
});


it.each(["seed", "scoped", "both"])("finalizes %s prerender output without requiring a legacy seed", async layout => {
  const dist = await mkdtemp(join(tmpdir(), "static-csp-"));
  try {
    const routes = ["/", "/privacy", "/terms"];
    const appRoutes = { "/(marketing)/page": "/", "/privacy/page": "/privacy", "/terms/page": "/terms" };
    await writeFile(join(dist, "app-path-routes-manifest.json"), JSON.stringify(appRoutes));
    await writeFile(join(dist, "routes-manifest.json"), JSON.stringify({ version: 3, headers: routes.map(source => ({ source, headers: [] })) }));
    await writeFile(join(dist, "prerender-manifest.json"), JSON.stringify({ routes: Object.fromEntries(routes.map(route => [route, { initialRevalidateSeconds: false }])) }));
    const paths: string[] = [];
    for (const [source, route] of Object.entries(appRoutes)) {
      const name = route === "/" ? "index" : route.slice(1);
      const owner = createHash("sha256").update(source).digest("hex");
      const outputs = [join(dist, `server/app/${name}.html`), join(dist, `server/route-cache/APP_PAGE/${owner}/$/${name}.html`)];
      for (const path of layout === "both" ? outputs : [outputs[layout === "seed" ? 0 : 1]]) {
        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, '<script src="/_next/static/test.js"></script><script>boot()</script>');
        paths.push(path);
      }
    }
    await mkdir(join(dist, "static"));
    await writeFile(join(dist, "static/test.js"), "boot()");
    await finalizeStaticCsp(dist);
    for (const path of paths) expect(await readFile(path, "utf8")).toContain("integrity=");
    const manifest = JSON.parse(await readFile(join(dist, "routes-manifest.json"), "utf8"));
    expect(manifest.headers.every((rule: { headers: { value: string }[] }) => rule.headers[0].value.includes("sha256-"))).toBe(true);
  } finally { await rm(dist, { recursive: true, force: true }); }
});
