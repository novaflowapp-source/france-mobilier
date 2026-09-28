import { NextResponse } from "next/server";
import { processDueOrderEmails } from "@/lib/orders/lifecycle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim() || process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await processDueOrderEmails();
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  return GET(request);
}
