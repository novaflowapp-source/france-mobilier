import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, prepareAuth } from "@/lib/auth";
import { getInvoiceByIdForUser } from "@/lib/invoices";
import { buildInvoicePdf } from "@/lib/invoice-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await prepareAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await params;
  const invoice = await getInvoiceByIdForUser(id, session.user.id);
  if (!invoice) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  const pdf = await buildInvoicePdf(invoice);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
    },
  });
}
