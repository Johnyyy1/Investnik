/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveApiOrigin } from "./api-url.ts";

const dev = { configured: undefined, metroHostUri: undefined, isDevelopment: true };

test("development uses the Metro host on the Next.js port, so a physical phone reaches the Mac", () => {
  assert.equal(resolveApiOrigin({ ...dev, metroHostUri: "192.168.1.20:8081" }), "http://192.168.1.20:3000");
  assert.equal(resolveApiOrigin({ ...dev, metroHostUri: "[fe80::1]:8081" }), "http://[fe80::1]:3000");
});

test("an explicit URL wins and is reduced to its origin", () => {
  assert.equal(resolveApiOrigin({ ...dev, configured: "http://10.0.2.2:4000/", metroHostUri: "192.168.1.20:8081" }), "http://10.0.2.2:4000");
  assert.equal(resolveApiOrigin({ configured: "https://investnik.cz/learn", metroHostUri: undefined, isDevelopment: false }), "https://investnik.cz");
});

test("release builds refuse plain http and a missing URL", () => {
  assert.throws(() => resolveApiOrigin({ configured: "http://investnik.cz", metroHostUri: undefined, isDevelopment: false }), /https in release builds/);
  assert.throws(() => resolveApiOrigin({ configured: undefined, metroHostUri: "192.168.1.20:8081", isDevelopment: false }), /required in release builds/);
});

test("malformed and non-web URLs are refused", () => {
  assert.throws(() => resolveApiOrigin({ ...dev, configured: "investnik.cz" }), /not an absolute URL/);
  assert.throws(() => resolveApiOrigin({ ...dev, configured: "ftp://investnik.cz" }), /must use https or http/);
  assert.throws(() => resolveApiOrigin(dev), /required/);
});
