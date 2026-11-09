import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("node:child_process", () => ({ spawnSync: vi.fn(() => ({ status: 0 })) }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

it("passes finalized CSP to the platform before it packages routes", async () => {
  const dist = await mkdtemp(join(tmpdir(), "csp-adapter-"));
  try {
    const platform = join(dist, "platform.mjs");
    await writeFile(platform, 'export default { name: "test", onBuildComplete(ctx) { ctx.packaged = true; } };');
    vi.stubEnv("INVESTI_PLATFORM_ADAPTER", platform);
    const sources = ["/", "/privacy", "/terms"];
    await writeFile(join(dist, "routes-manifest.json"), JSON.stringify({ headers: sources.map(source => ({ source, headers: [{ key: "Content-Security-Policy", value: "script-src 'sha256-test' 'strict-dynamic'" }] })) }));
    const context = { distDir: dist, projectDir: dist, packaged: false, routing: { beforeMiddleware: sources.map(source => ({ source, headers: { "Content-Security-Policy": "script-src 'strict-dynamic'" } })) } };
    const { default: adapter } = await import("../../scripts/static-csp-adapter.mjs");
    await adapter.onBuildComplete(context);
    expect(context.packaged).toBe(true);
    for (const route of context.routing.beforeMiddleware) expect(route.headers["Content-Security-Policy"]).toContain("'sha256-test'");
    context.routing.beforeMiddleware = [];
    await expect(adapter.onBuildComplete(context)).rejects.toThrow("Missing adapter CSP route");
  } finally { await rm(dist, { recursive: true, force: true }); }
});
