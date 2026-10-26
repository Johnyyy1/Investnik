import { artifactPayloadSchemas, type ArtifactPayload } from "@/features/artifacts/schemas";
import { decimalToBps, decimalToMinor } from "@/features/ips/presentation";
import { tradeFeeMinor } from "@/features/portfolio/costs";

export const FEE_SCHEDULE_LESSON_ID = "broker-fee-schedule";

/** The fictional tariff the lesson reads (2.1.6). Its numbers feed the prose, the answers and the form defaults. */
export const lessonTariff = { tradeFee: { rateBps: 15, minMinor: 6_000n, maxMinor: 60_000n }, fxBps: 50, custodyBps: 10, custodyFreeUpToMinor: 50_000_000n } as const;
export const lessonTradeFeeMinor = (amountMinor: bigint) => tradeFeeMinor(lessonTariff.tradeFee, amountMinor);

export type FeeProfileDraft = { label: string; rate: string; minimum: string; maximum: string; fx: string; custody: string; custodyFreeUpTo: string };
export const defaultFeeProfileDraft = (): FeeProfileDraft => ({ label: "Fiktivní ceník z lekce", rate: "0,15", minimum: "60", maximum: "600", fx: "0,5", custody: "0,1", custodyFreeUpTo: "500000" });

/** Percentages have two decimals, so they map exactly onto basis points; amounts are Kč with haléře. */
export function feeProfileFromDraft(draft: FeeProfileDraft): ArtifactPayload<"fee_profile"> {
  let payload;
  try {
    payload = {
      label: draft.label.trim(), currency: "CZK" as const, orderFeeMinor: "0", monthlyFeeMinor: "0",
      orderFeeBasisPoints: decimalToBps(draft.rate), minimumOrderFeeMinor: decimalToMinor(draft.minimum), maximumOrderFeeMinor: decimalToMinor(draft.maximum),
      fxSpreadBasisPoints: decimalToBps(draft.fx), custodyBasisPoints: decimalToBps(draft.custody), custodyFreeUpToMinor: decimalToMinor(draft.custodyFreeUpTo),
    };
  } catch { throw new Error("Procenta zadej od 0 do 100 a částky v Kč, vždy nejvýše na dvě desetinná místa."); }
  if (BigInt(payload.maximumOrderFeeMinor) < BigInt(payload.minimumOrderFeeMinor)) throw new Error("Maximální poplatek nesmí být nižší než minimální.");
  const parsed = artifactPayloadSchemas.fee_profile.safeParse(payload);
  if (!parsed.success) throw new Error("Doplň název profilu do 160 znaků a částky do 13 číslic.");
  return parsed.data;
}
