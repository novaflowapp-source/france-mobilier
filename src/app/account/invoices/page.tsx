"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { store } from "@/config/store";
import { authClient } from "@/lib/auth-client";
import { useProApproved } from "@/lib/use-pro-approved";

type Invoice = {
  id: string;
  number: string;
  orderId: string;
  amountCents: number;
  issuedAt: string;
};

export default function CompteFacturesPage() {
  const { data: session, isPending } = authClient.useSession();
  const approved = useProApproved();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/invoices")
      .then((res) => (res.ok ? res.json() : { invoices: [] }))
      .then((data) => setInvoices(data.invoices || []))
      .catch(() => {});
  }, [session?.user]);

  if (isPending) {
    return <p className="text-muted">Loading…</p>;
  }

  if (!session?.user) {
    return (
      <Link href="/login?next=/account/invoices" className="btn btn-primary inline-flex">
        Sign in
      </Link>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">My invoices</h1>
      {!approved ? (
        <p className="text-muted">
          Business invoices appear here after Pro access is activated.{" "}
          <Link href="/account/company" className="underline">
            My company
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border bg-cream/50">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted" colSpan={5}>
                    No invoices yet. They appear after a professional order is paid.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{invoice.number}</td>
                    <td className="px-4 py-3">
                      {new Date(invoice.issuedAt).toLocaleDateString(store.locale)}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/order/${invoice.orderId}`} className="underline">
                        View
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {(invoice.amountCents / 100).toLocaleString(store.locale, {
                        style: "currency",
                        currency: store.currency,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/api/invoices/${invoice.id}`} className="btn btn-secondary px-3 py-1.5 text-sm">
                        Download
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
