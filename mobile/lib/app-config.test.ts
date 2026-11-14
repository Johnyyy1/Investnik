/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { appConfigFallback, parseAppConfig } from "./app-config.ts";

test("a valid body is returned as is", () => {
  const body = { minSupportedVersion: "0.2.0", latestVersion: "0.3.0", maintenance: true };
  assert.deepEqual(parseAppConfig(body), body);
  assert.deepEqual(parseAppConfig({ minSupportedVersion: null, latestVersion: null, maintenance: false }), appConfigFallback);
});

test("a missing or malformed body never blocks the app", () => {
  assert.deepEqual(parseAppConfig(undefined), appConfigFallback);
  assert.deepEqual(parseAppConfig({ error: { code: "internal", message: "x" } }), appConfigFallback);
  assert.deepEqual(parseAppConfig({ minSupportedVersion: 2, latestVersion: null, maintenance: false }), appConfigFallback);
  assert.deepEqual(parseAppConfig({ minSupportedVersion: null, latestVersion: null, maintenance: "yes" }), appConfigFallback);
});
