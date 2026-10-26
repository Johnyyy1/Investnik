import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { readPublicShare } from "@/features/sharing/repository";
import { summaryLines } from "@/features/sharing/domain";
import { formatDate } from "@/lib/formatters";
import { BRAND_NAME, SITE_HOST } from "@/lib/site";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow", "Content-Disposition": 'inline; filename="investi-muj-plan.png"' };
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const plan = await readPublicShare((await params).token);
  if (!plan) return new Response(null, { status: 404, headers });
  const [font, css] = await Promise.all([readFile(join(process.cwd(), "public/fonts/inter-share.ttf")), readFile(join(process.cwd(), "src/styles/tokens.css"), "utf8")]);
  const color = (role: string) => {
    const value = css.split(`--color-${role}:`)[1]?.split(";")[0].trim();
    if (!value?.startsWith("#")) throw new Error("Missing direct image design token");
    return value;
  };
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: color("background"), color: color("foreground"), fontFamily: "Inter", padding: 64, gap: 24 }}>
    <div style={{ display: "flex", color: color("primary"), fontSize: 28 }}>{BRAND_NAME} · Výstup učení · verze {plan.version} · {formatDate(plan.createdAt, { timeZone: "Europe/Prague" })}</div>
    <div style={{ display: "flex", fontSize: 52 }}>Můj investiční postup</div>
    {summaryLines(plan.summary).map((line) => <div key={line} style={{ display: "flex", fontSize: 30 }}>{line}</div>)}
    <div style={{ display: "flex", fontSize: 22, marginTop: "auto" }}>Vytvoř si vlastní · {SITE_HOST} · Vzdělávání, ne investiční doporučení.</div>
  </div>, { width: 1200, height: 630, fonts: [{ name: "Inter", data: font, weight: 400 }], headers });
}
