import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { hashDocument } from "../../scripts/static-csp.mjs";

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
