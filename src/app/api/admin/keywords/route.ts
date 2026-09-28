import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import {
  fetchKeywordHistoricalMetrics,
  fetchKeywordIdeas,
  isKeywordPlannerConfigured,
  listMissingKeywordPlannerEnv,
  parseKeywordList,
} from "@/lib/keywords/google-ads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  keywords: z.string().min(1).max(4000),
  mode: z.enum(["metrics", "ideas"]).optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin access required" }, { status: 401 });
  }
  return NextResponse.json({
    configured: isKeywordPlannerConfigured(),
    missing: listMissingKeywordPlannerEnv(),
    geo: "France",
    language: "English",
    network: "Google",
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin access required" }, { status: 401 });
  }
  if (!isKeywordPlannerConfigured()) {
    return NextResponse.json(
      {
        error: "Google Ads is not connected yet. Add the GOOGLE_ADS_* variables and try again.",
        missing: listMissingKeywordPlannerEnv(),
      },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const keywords = parseKeywordList(parsed.data.keywords);
  const mode = parsed.data.mode || "metrics";
  const max = mode === "ideas" ? 10 : 40;
  if (keywords.length === 0) {
    return NextResponse.json({ error: "Enter at least one keyword." }, { status: 400 });
  }
  if (keywords.length > max) {
    return NextResponse.json(
      { error: `Maximum ${max} keywords for this mode.` },
      { status: 400 },
    );
  }

  try {
    const results =
      mode === "ideas"
        ? await fetchKeywordIdeas(keywords)
        : await fetchKeywordHistoricalMetrics(keywords);
    return NextResponse.json({
      ok: true,
      mode,
      requested: keywords,
      results,
      geo: "France",
      language: "English",
      network: "Google",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The Keyword Planner request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
