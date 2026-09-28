"use client";

import { useState } from "react";

type Quote = {
  id: string;
  reference: string;
  companyName: string | null;
  email: string;
  amountCents: number;
  status: string;
  createdAt: string;
};

export function AdminQuotes({ initial }: { initial: Quote[] }) {
  const [rows, setRows] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ items: { name: string; quantity: number; unitPriceCents: number }[] } | null>(null);

  async function load(id: string) {
    setOpenId(id);
    const res = await fetch(`/api/admin/quotes?id=${id}`);
    const data = await res.json();
    setDetail(data.quote || null);
  }

  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/admin/quotes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (data.quote) {
      setRows((current) => current.map((row) => (row.id === id ? { ...row, status: data.quote.status } : row)));
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-background/60">
          <tr>
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0 align-top">
              <td className="px-4 py-3">
                <button type="button" className="font-medium underline" onClick={() => load(row.id)}>
                  {row.reference}
                </button>
                {openId === row.id && detail?.items ? (
                  <ul className="mt-2 text-xs text-muted">
                    {detail.items.map((item) => (
                      <li key={item.name}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </td>
              <td className="px-4 py-3">
                {row.companyName || "—"}
                <p className="text-xs text-muted">{row.email}</p>
              </td>
              <td className="px-4 py-3">{new Date(row.createdAt).toLocaleDateString("en-US")}</td>
              <td className="px-4 py-3">
                {(row.amountCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </td>
              <td className="px-4 py-3">
                <select
                  className="input py-1"
                  value={row.status}
                  onChange={(e) => setStatus(row.id, e.target.value)}
                >
                  {["requested", "reviewing", "sent", "accepted", "rejected", "expired"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
