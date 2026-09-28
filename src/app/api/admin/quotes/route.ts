import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { getQuoteById, listQuotesForAdmin, setQuoteStatus, type QuoteStatus } from "@/lib/quotes";

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["requested", "reviewing", "sent", "accepted", "rejected", "expired"]),
});

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    const quote = await getQuoteById(id);
    if (!quote) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ quote });
  }
  const quotes = await listQuotesForAdmin();
  return NextResponse.json({ quotes });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 401 });
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const quote = await setQuoteStatus(parsed.data.id, parsed.data.status as QuoteStatus, session.user.email);
  if (!quote) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true, quote });
}
