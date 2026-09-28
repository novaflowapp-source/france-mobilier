import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { activityLabel, volumeLabel } from "@/lib/b2b";
import { sendProAccessActivatedEmail } from "@/lib/mail";
import {
  getProAccessById,
  listProAccessForAdmin,
  setProAccessStatus,
  setProDiscount,
  type ProAccessStatus,
} from "@/lib/pro-access";

const patchSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["approve", "reject", "suspend", "reactivate", "discount"]),
  discountType: z.enum(["percentage", "fixed"]).nullable().optional(),
  discountValue: z.number().min(0).max(90).nullable().optional(),
});

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin access required" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ProAccessStatus | "all" | null;
  const rows = await listProAccessForAdmin(status || "all");
  return NextResponse.json({
    professionals: rows.map((row) => ({
      ...row,
      activityLabel: activityLabel(row.activityOther ? "autre" : row.activity) || row.activity,
      volumeLabel: volumeLabel(row.expectedOrderVolume),
    })),
  });
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
  const actorEmail = session.user.email;
  const current = await getProAccessById(parsed.data.id);
  if (!current) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  if (parsed.data.action === "discount") {
    const type = parsed.data.discountType ?? null;
    const value = type ? parsed.data.discountValue ?? null : null;
    const updated = await setProDiscount({
      id: parsed.data.id,
      discountType: type,
      discountValue: value,
      actorEmail,
    });
    return NextResponse.json({ ok: true, request: updated });
  }

  const nextStatus: ProAccessStatus =
    parsed.data.action === "approve" || parsed.data.action === "reactivate"
      ? "approved"
      : parsed.data.action === "reject"
        ? "rejected"
        : "suspended";

  const updated = await setProAccessStatus({
    id: parsed.data.id,
    status: nextStatus,
    actorEmail,
  });

  if (parsed.data.action === "approve" && current.status !== "approved" && updated) {
    const { db } = await import("@/lib/db");
    const { user: userTable } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const rows = await db
      .select({ email: userTable.email })
      .from(userTable)
      .where(eq(userTable.id, updated.userId))
      .limit(1);
    if (rows[0]?.email) {
      await sendProAccessActivatedEmail({
        email: rows[0].email,
        firstName: updated.firstName,
        companyName: updated.companyName || updated.legalName,
        siren: updated.siren,
      });
    }
  }

  return NextResponse.json({ ok: true, request: updated });
}
