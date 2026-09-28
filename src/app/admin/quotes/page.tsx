import type { Metadata } from "next";
import Link from "next/link";
import { AdminQuotes } from "@/components/admin-quotes";
import { getAdminSession } from "@/lib/admin";
import { listQuotesForAdmin } from "@/lib/quotes";

export const metadata: Metadata = {
  title: "Trade quotes",
  robots: { index: false, follow: false },
};

export default async function AdminDevisPage() {
  const admin = await getAdminSession();
  if (!admin) {
    return (
      <div className="container-page py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Trade quotes</h1>
        <p className="mt-3">
          <Link href="/login?next=/admin/quotes" className="underline">
            Admin sign in
          </Link>
        </p>
      </div>
    );
  }
  const quotes = await listQuotesForAdmin();
  return (
    <div className="container-page space-y-8 py-10 md:py-14">
      <p className="text-sm">
        <Link href="/admin" className="text-muted hover:underline">
          Admin
        </Link>
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Trade quotes</h1>
      <AdminQuotes
        initial={quotes.map((quote) => ({
          id: quote.id,
          reference: quote.reference,
          companyName: quote.companyName,
          email: quote.email,
          amountCents: quote.amountCents,
          status: quote.status,
          createdAt: quote.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
