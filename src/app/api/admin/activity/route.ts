import { NextResponse } from "next/server";
import { getActivityAdminSession } from "@/lib/admin";
import { activitySummary, listRecentActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getActivityAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const [events, summary] = await Promise.all([listRecentActivity(100), activitySummary()]);
  return NextResponse.json(
    { events, summary },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
