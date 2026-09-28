import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth, prepareAuth } from "@/lib/auth";
import { createQuoteRequest, listQuotesForUser } from "@/lib/quotes";
import { getProAccessByUserId, isProApproved } from "@/lib/pro-access";

const schema = z.object({
  source: z.enum(["product", "cart", "account"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1).optional(),
        quantity: z.number().int().min(1).max(200),
      }),
    )
    .min(1)
    .max(40),
  desiredDate: z.string().trim().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
});

export async function GET() {
  await prepareAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const quotes = await listQuotesForUser(session.user.id);
  return NextResponse.json({ quotes });
}

export async function POST(request: Request) {
  await prepareAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const pro = await getProAccessByUserId(session.user.id);
  if (!isProApproved(pro)) {
    return NextResponse.json({ error: "Trade access must be approved before requesting a quote." }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Check your quote request." }, { status: 400 });
  }
  try {
    const quote = await createQuoteRequest({
      userId: session.user.id,
      email: session.user.email,
      source: parsed.data.source,
      items: parsed.data.items,
      companyName: pro?.companyName,
      siren: pro?.siren,
      contactName: [pro?.firstName, pro?.lastName].filter(Boolean).join(" ") || session.user.name,
      phone: pro?.phone,
      desiredDate: parsed.data.desiredDate,
      message: parsed.data.message,
    });
    return NextResponse.json({ ok: true, quote });
  } catch (error) {
    const code = error instanceof Error ? error.message : "Erreur";
    const map: Record<string, string> = {
      DEVIS_VIDE: "Ajoutez au moins un produit.",
      PRODUIT_INTROUVABLE: "Un produit n’est plus disponible.",
      VARIANTE_INTROUVABLE: "Une variante n’est plus disponible.",
    };
    return NextResponse.json({ error: map[code] || "Demande impossible." }, { status: 400 });
  }
}
