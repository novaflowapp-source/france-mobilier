import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { listModerationReviews, setReviewStatus } from "@/lib/reviews";

const patchSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["approve", "archive"]),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin access required" }, { status: 401 });
  }
  const reviews = await listModerationReviews();
  return NextResponse.json({ reviews });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin access required" }, { status: 401 });
  }

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const status = parsed.data.action === "approve" ? "approved" : "archived";
  await setReviewStatus(parsed.data.id, status);
  const reviews = await listModerationReviews();
  return NextResponse.json({ ok: true, status, reviews });
}
