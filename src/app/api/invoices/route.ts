import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, prepareAuth } from "@/lib/auth";
import { listInvoicesForUser } from "@/lib/invoices";

export async function GET() {
  await prepareAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const invoices = await listInvoicesForUser(session.user.id);
  return NextResponse.json({ invoices });
}
