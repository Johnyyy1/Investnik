import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const platform = (await import(pathToFileURL(process.env.INVESTI_PLATFORM_ADAPTER).href)).default;

const adapter = {
  ...platform,
  name: `static-csp:${platform.name}`,
  async onBuildComplete(context) {
    // Package the transformed HTML and policies, before the platform copies either one.
    const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/static-csp.mts"], { cwd: context.projectDir, stdio: "inherit" });
    assert.equal(result.status, 0, "Static CSP finalization failed before adapter packaging");
    const manifest = JSON.parse(await readFile(resolve(context.distDir, "routes-manifest.json"), "utf8"));
    for (const source of ["/", "/privacy", "/terms"]) {
      const policy = manifest.headers.find(rule => rule.source === source);
      assert.ok(policy, `Missing static CSP for ${source}`);
      let updated = false;
      for (const routes of Object.values(context.routing)) {
        if (!Array.isArray(routes)) continue;
        for (const route of routes) {
          if (route.source === source && route.headers) {
            Object.assign(route.headers, Object.fromEntries(policy.headers.map(({ key, value }) => [key, value])));
            updated = true;
          }
        }
      }
      assert.ok(updated, `Missing adapter CSP route for ${source}`);
    }
    await platform.onBuildComplete?.(context);
  },
};

export default adapter;
