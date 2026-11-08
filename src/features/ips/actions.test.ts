import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
const mocks = vi.hoisted(() => ({ owner: vi.fn(), unlock: vi.fn(), budget: vi.fn(), apply: vi.fn(), search: vi.fn(), metadata: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/session", () => ({ getCurrentUser: mocks.owner }));
vi.mock("@/features/progression/repository", () => ({ requirePortfolioLabUnlock: mocks.unlock }));
vi.mock("@/features/rate-limit", () => ({ enforceMarketDataBudget: mocks.budget }));
vi.mock("@/features/portfolio/environment", () => ({ portfolioMarketData: { service: { searchInstruments: mocks.search, getInstrumentMetadata: mocks.metadata } } }));
vi.mock("@/db", () => ({ db: {} }));
// The real loadIpsInstrument runs, so the type check is the one applyIpsTarget uses.
vi.mock("./repository", async (original) => ({ ...await original<typeof import("./repository")>(), applyIpsTarget: mocks.apply }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import { applyIpsTargetAction, checkIpsInstrumentAction, searchIpsInstrumentsAction } from "./actions";
import { createDeterministicMarketDataService } from "@/features/market-data/deterministic/service";
import { MarketDataError } from "@/features/market-data/errors";
import { PortfolioInputError } from "@/features/portfolio/decimal";
import { PortfolioLabLockedError } from "@/features/progression/errors";
import { RequestRateLimitedError } from "@/features/rate-limit/limiter";
const input = { artifactId: "2febc313-313b-40ba-af9a-a93534e3cabf", portfolioId: "3febc313-313b-40ba-af9a-a93534e3cabf", requestId: "4febc313-313b-40ba-af9a-a93534e3cabf" };
describe("IPS boundaries", () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.owner.mockResolvedValue({ id: "owner", isAnonymous: false }); mocks.apply.mockResolvedValue({ duplicate: false, allocationId: "mix" }); mocks.search.mockResolvedValue([]); });
  it.each([null, { id: "guest", isAnonymous: true, anonymousKind: "guest" }])("refuses missing and guest sessions %j", async (owner) => {
    mocks.owner.mockResolvedValue(owner);
    expect((await applyIpsTargetAction(input)).ok).toBe(false); expect((await searchIpsInstrumentsAction("test")).ok).toBe(false);
    expect(mocks.apply).not.toHaveBeenCalled(); expect(mocks.search).not.toHaveBeenCalled();
  });
  it("requires recorded Lab access for targets and derives ownership from session", async () => {
    expect((await applyIpsTargetAction(input)).ok).toBe(true);
    expect(mocks.unlock).toHaveBeenCalledWith("owner"); expect(mocks.apply).toHaveBeenCalledWith("owner", input);
    mocks.apply.mockClear(); mocks.unlock.mockRejectedValue(new PortfolioLabLockedError("locked"));
    expect((await applyIpsTargetAction(input)).ok).toBe(false); expect(mocks.apply).not.toHaveBeenCalled();
  });
  it("rejects client-authored weights, execution data, ownership, generation omissions and malformed identities", async () => {
    for (const patch of [{ userId: "victim" }, { lines: [] }, { price: 1 }, { portfolioId: undefined }, { requestId: "bad" }]) expect((await applyIpsTargetAction({ ...input, ...patch })).ok).toBe(false);
    expect(mocks.apply).not.toHaveBeenCalled();
  });
  it("permits discovery before unlock, rate limits it and drops only known non-IPS types", async () => {
    mocks.search.mockResolvedValue(["equity", "etf", "bond", "cash", "index", null].map((assetType) => ({ instrumentId: String(assetType), assetType })));
    const result = await searchIpsInstrumentsAction("  fund  ");
    expect(result.results.map((r) => r.assetType)).toEqual(["equity", "etf", "bond", null]);
    expect(mocks.search).toHaveBeenCalledWith("fund"); expect(mocks.budget).toHaveBeenCalledWith("owner", "search"); expect(mocks.unlock).not.toHaveBeenCalled();
    expect((await searchIpsInstrumentsAction("a")).ok).toBe(false);
  });
  it("keeps untyped FMP-like results, like the Lab search", async () => {
    const fmp = (symbol: string) => ({ instrumentId: `US-XASE:${symbol}`, symbol, name: symbol, assetType: null, exchangeMic: "XASE", exchangeCode: "AMEX", quoteCurrency: "USD", provider: "fmp", providerSymbol: symbol });
    mocks.search.mockResolvedValue([fmp("SPY"), fmp("VOO"), { ...fmp("SPX"), assetType: "index" }, { ...fmp("USD"), assetType: "cash" }]);
    expect((await searchIpsInstrumentsAction("spy")).results.map((r) => r.symbol)).toEqual(["SPY", "VOO"]);
  });
  it("returns the same deterministic results as before the FMP fix", async () => {
    const service = createDeterministicMarketDataService();
    mocks.search.mockImplementation((query: string) => service.searchInstruments(query));
    for (const query of ["VWCE", "CZK", "SPX", "Index", "Inc", "ETF", "dluhopis"]) {
      const before = (await service.searchInstruments(query)).filter(({ assetType }) => assetType === "equity" || assetType === "etf" || assetType === "bond");
      expect((await searchIpsInstrumentsAction(query)).results, query).toEqual(before);
    }
  });
  it("verifies the type from server metadata when a result is chosen", async () => {
    const service = createDeterministicMarketDataService();
    mocks.metadata.mockImplementation((id: string) => service.getInstrumentMetadata(id));
    expect(await checkIpsInstrumentAction("IE-XETR:VWCE")).toEqual({ ok: true, instrument: { instrumentId: "IE-XETR:VWCE", symbol: "VWCE", name: "Vanguard FTSE All-World UCITS ETF", assetType: "etf" } });
    expect(mocks.budget).toHaveBeenCalledWith("owner", "instrument-preview"); expect(mocks.unlock).not.toHaveBeenCalled();
    for (const id of ["US-XCBO:SPX", "CASH:CZK", "US-XNAS:NOPE"]) {
      expect(await checkIpsInstrumentAction(id)).toEqual({ ok: false, message: "Tento nástroj podle ověřených údajů není akcie, ETF ani dluhopis, takže do plánu nepatří. Vyber jiný." });
    }
    // FMP rejects mutual funds in metadata; that is a refusal, not an outage.
    mocks.metadata.mockRejectedValue(new MarketDataError("UnsupportedInstrument", "Mutual funds are not supported."));
    expect((await checkIpsInstrumentAction("US-XNAS:VFIAX")).ok).toBe(false);
    for (const owner of [null, { id: "guest", isAnonymous: true, anonymousKind: "guest" }]) { mocks.owner.mockResolvedValueOnce(owner); expect((await checkIpsInstrumentAction("IE-XETR:VWCE")).ok).toBe(false); }
    mocks.metadata.mockClear();
    expect((await checkIpsInstrumentAction("")).ok).toBe(false); expect(mocks.metadata).not.toHaveBeenCalled();
  });
  it("keeps provider and database details out of errors", async () => {
    mocks.apply.mockRejectedValue(new Error("private provider secret")); mocks.search.mockRejectedValue(new Error("private"));
    for (const result of [await applyIpsTargetAction(input), await searchIpsInstrumentsAction("fund")]) { expect(result.ok).toBe(false); expect(JSON.stringify(result)).not.toContain("private"); }
  });
});

describe("IPS failure logging", () => {
  let log: MockInstance<typeof console.error>;
  beforeEach(() => { vi.resetAllMocks(); mocks.owner.mockResolvedValue({ id: "owner", isAnonymous: false }); log = vi.spyOn(console, "error").mockImplementation(() => {}); });
  afterEach(() => log.mockRestore());

  it("logs an unexpected failure once per action and keeps the learner message", async () => {
    mocks.apply.mockRejectedValue(new Error("connection terminated")); mocks.search.mockRejectedValue(new MarketDataError("ProviderUnavailable", "Provider timed out."));
    expect(await applyIpsTargetAction(input)).toEqual({ ok: false, message: "Cílový mix se nepodařilo uložit. Ověř odemčení Labu a dostupnost nástrojů a zkus to znovu." });
    expect(await searchIpsInstrumentsAction("fund")).toEqual({ ok: false, results: [], message: "Hledání se nepodařilo. Zkus jiný název nebo to zkus později." });
    mocks.metadata.mockRejectedValue(new MarketDataError("ProviderUnavailable", "Provider timed out."));
    expect(await checkIpsInstrumentAction("US-XASE:SPY")).toEqual({ ok: false, message: "Typ nástroje se teď nepodařilo ověřit. Zkus ho vybrat znovu za chvíli." });
    expect(log.mock.calls.map(([entry]) => entry)).toEqual(["[ips] apply target failed", "[ips] search instruments failed", "[ips] check instrument failed"]);
  });

  it("does not log a locked Lab, a changed plan, rate limits or a too-short query", async () => {
    mocks.unlock.mockRejectedValueOnce(new PortfolioLabLockedError("locked"));
    await applyIpsTargetAction(input);
    mocks.apply.mockRejectedValueOnce(new PortfolioInputError("PortfolioChanged", "Portfolio se mezitím změnilo."));
    await applyIpsTargetAction(input);
    mocks.budget.mockRejectedValue(new RequestRateLimitedError({ allowed: false, retryAfterSeconds: 30, deniedScope: "market-data:search" }));
    await applyIpsTargetAction(input);
    await searchIpsInstrumentsAction("fund");
    await searchIpsInstrumentsAction("a");
    await checkIpsInstrumentAction("IE-XETR:VWCE");
    mocks.budget.mockResolvedValue(undefined); mocks.metadata.mockRejectedValue(new MarketDataError("UnsupportedInstrument", "Mutual funds are not supported."));
    await checkIpsInstrumentAction("US-XNAS:VFIAX");
    expect(log).not.toHaveBeenCalled();
  });
});
