"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { isGuestIdentity } from "@/features/guest/identity";
import { requirePortfolioLabUnlock } from "@/features/progression/repository";
import { PortfolioLabLockedError } from "@/features/progression/errors";
import { enforceMarketDataBudget } from "@/features/rate-limit";
import { isRequestRateLimitedError } from "@/features/rate-limit/limiter";
import { isMarketDataError } from "@/features/market-data/errors";
import { logUnexpectedError } from "@/lib/server-errors";
import { portfolioMarketData } from "@/features/portfolio/environment";
import { PortfolioInputError } from "@/features/portfolio/decimal";
import { instrumentIdSchema } from "@/features/portfolio/input";
import { applyIpsTarget, loadIpsInstrument } from "./repository";

const applySchema = z.strictObject({ artifactId: z.uuid(), portfolioId: z.uuid(), requestId: z.uuid() });
export async function applyIpsTargetAction(input: unknown) {
  try {
    const owner = await getCurrentUser();
    if (!owner || isGuestIdentity(owner)) return { ok: false as const, message: "Pro použití plánu se přihlas k uloženému účtu." };
    const parsed = applySchema.safeParse(input);
    if (!parsed.success) return { ok: false as const, message: "Načti aktuální plán a zkus to znovu." };
    await requirePortfolioLabUnlock(owner.id);
    await enforceMarketDataBudget(owner.id, "allocation-quotes");
    const result = await applyIpsTarget(owner.id, parsed.data);
    revalidatePath("/lab/portfolio");
    return { ok: true as const, ...result };
  } catch (error) {
    // Input is validated above, so a schema error here is a stored plan that no longer parses: a failure.
    if (!(error instanceof PortfolioInputError || error instanceof PortfolioLabLockedError || isRequestRateLimitedError(error))) logUnexpectedError("ips", "apply target", error);
    return { ok: false as const, message: error instanceof PortfolioInputError ? error.message : "Cílový mix se nepodařilo uložit. Ověř odemčení Labu a dostupnost nástrojů a zkus to znovu." };
  }
}

/** Planning can happen before Lab unlock; discovery does not grant trading access. */
export async function searchIpsInstrumentsAction(query: string) {
  try {
    const owner = await getCurrentUser();
    if (!owner || isGuestIdentity(owner)) return { ok: false as const, results: [], message: "Pro hledání nástrojů se přihlas." };
    const parsed = z.string().trim().min(2).max(80).parse(query);
    await enforceMarketDataBudget(owner.id, "search");
    const results = await portfolioMarketData.service.searchInstruments(parsed);
    // Same rule as the Lab search: FMP results are untyped (null), so drop only known non-IPS types and verify on selection.
    return { ok: true as const, results: results.filter(({ assetType }) => assetType !== "cash" && assetType !== "index") };
  } catch (error) {
    if (!(error instanceof z.ZodError || isRequestRateLimitedError(error) || (isMarketDataError(error) && error.code === "InvalidSearchQuery"))) logUnexpectedError("ips", "search instruments", error);
    return { ok: false as const, results: [], message: "Hledání se nepodařilo. Zkus jiný název nebo to zkus později." };
  }
}

/** Verifies a chosen search result from server metadata before it enters the plan draft. */
export async function checkIpsInstrumentAction(instrumentId: string) {
  try {
    const owner = await getCurrentUser();
    if (!owner || isGuestIdentity(owner)) return { ok: false as const, message: "Pro výběr nástrojů se přihlas." };
    const id = instrumentIdSchema.parse(instrumentId);
    await enforceMarketDataBudget(owner.id, "instrument-preview");
    const instrument = await loadIpsInstrument(id);
    if (!instrument) return { ok: false as const, message: "Tento nástroj podle ověřených údajů není akcie, ETF ani dluhopis, takže do plánu nepatří. Vyber jiný." };
    return { ok: true as const, instrument: { instrumentId: instrument.instrumentId, symbol: instrument.symbol, name: instrument.name, assetType: instrument.assetType } };
  } catch (error) {
    if (!(error instanceof z.ZodError || isRequestRateLimitedError(error))) logUnexpectedError("ips", "check instrument", error);
    return { ok: false as const, message: "Typ nástroje se teď nepodařilo ověřit. Zkus ho vybrat znovu za chvíli." };
  }
}
