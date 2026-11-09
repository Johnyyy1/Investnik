import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = process.env.STATIC_CSP_TEST_URL ?? "http://localhost:3406";
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "chrome" });
try {
  const context = await browser.newContext();
  for (const route of ["/", "/privacy", "/terms"]) {
    const page = await context.newPage();
    const violations = [];
    await page.exposeFunction("recordViolation", value => violations.push(value));
    await page.addInitScript(() => document.addEventListener("securitypolicyviolation", event => window.recordViolation(`${event.effectiveDirective}: ${event.blockedURI}`)));
    const response = await page.goto(`${baseURL}${route}`);
    assert.equal(response.status(), 200);
    const headers = response.headers();
    assert.match(headers["content-security-policy"], /'sha256-/);
    assert.match(headers["content-security-policy"], /'strict-dynamic'/);
    assert.ok(!headers["content-security-policy"].includes("'nonce-"));
    assert.ok(!headers["cache-control"].includes("private"));
    await page.waitForLoadState("networkidle");
    assert.deepEqual(violations, [], `${route} must load without CSP violations`);
    // Inject into the parsed response: DevTools evaluate itself bypasses page CSP.
    await page.route(`${baseURL}${route}`, async intercepted => {
      const response = await intercepted.fetch();
      const body = (await response.text()).replace("</body>", '<script>window.cspInjectionExecuted = true</script></body>');
      await intercepted.fulfill({ response, body });
    });
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.evaluate(() => window.cspInjectionExecuted), undefined);
    assert.ok(violations.some(value => value === "script-src-elem: inline"), "Injected inline script must be rejected");
    await page.close();
  }
  for (const route of ["/sign-in", "/sign-up"]) {
    const first = await context.request.get(`${baseURL}${route}`);
    const second = await context.request.get(`${baseURL}${route}`);
    const csp = first.headers()["content-security-policy"];
    assert.match(csp, /'nonce-[^']+'/);
    assert.notEqual(csp, second.headers()["content-security-policy"]);
    assert.match(await first.text(), /nonce="[^"]+"/);
  }
  console.log("Static hash CSP, blocked injection, cache headers and fresh auth nonces passed.");
} finally {
  await browser.close();
}
