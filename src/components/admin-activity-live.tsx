"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ActivityEvent, ActivitySummary } from "@/lib/activity";

function formatWhen(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Europe/Paris",
  }).format(date);
}

function formatDay(value: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "Europe/Paris",
  }).format(date);
}

function formatMoney(cents: number | null) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function actionLabel(type: ActivityEvent["type"]) {
  if (type === "purchase") return "Purchase";
  if (type === "begin_checkout") return "Stripe checkout";
  if (type === "product_view") return "View";
  return "Cart";
}

function StatCard({
  label,
  total,
  last24h,
  money = false,
}: {
  label: string;
  total: number;
  last24h: number;
  money?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{money ? formatMoney(total) : total}</p>
      <p className="mt-1 text-xs text-muted">
        including {money ? formatMoney(last24h) : last24h} in the last 24h
      </p>
    </div>
  );
}

export function AdminActivityLive() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/activity", { cache: "no-store", credentials: "same-origin" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load");
        if (cancelled) return;
        setEvents(data.events || []);
        setSummary(data.summary || null);
        setUpdatedAt(new Date());
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error");
      }
    }
    void load();
    const timer = setInterval(() => void load(), 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const since = formatDay(summary?.trackedSince ?? null);

  return (
    <div className="space-y-6">
      {summary ? (
        <>
          <p className="text-sm text-muted">
            Totals since {since ?? "tracking started"} — not just the last 24 hours.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Product views" total={summary.productViews} last24h={summary.last24h.productViews} />
            <StatCard label="Add to cart" total={summary.addToCart} last24h={summary.last24h.addToCart} />
            <StatCard
              label="Stripe checkouts"
              total={summary.beginCheckout}
              last24h={summary.last24h.beginCheckout}
            />
            <StatCard label="Paid orders" total={summary.purchases} last24h={summary.last24h.purchases} />
            <StatCard
              label="Paid revenue"
              total={summary.revenueCents}
              last24h={summary.last24h.revenueCents}
              money
            />
          </div>
          {summary.topViewed.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <p className="border-b border-border px-4 py-3 text-sm font-medium">Most viewed products</p>
              <ul className="divide-y divide-border text-sm">
                {summary.topViewed.map((row) => (
                  <li key={`${row.productId}-${row.productName}`} className="flex justify-between gap-4 px-4 py-3">
                    <span>{row.productName}</span>
                    <span className="shrink-0 font-medium">{row.views}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}

      <p className="text-xs text-muted">
        {updatedAt
          ? `Updated ${formatWhen(updatedAt)} — refreshes every 4 seconds.`
          : "Loading…"}
        {error ? ` ${error}` : ""}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-border bg-background/60">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Details</th>
              <th className="px-4 py-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-muted">
                  No activity yet. Carts, Stripe checkouts, and purchases show up here.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                    {formatWhen(event.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium">{actionLabel(event.type)}</td>
                  <td className="px-4 py-3">
                    <p>{event.productName || "—"}</p>
                    <p className="text-xs text-muted">
                      {event.type === "purchase" && event.orderId ? (
                        <Link href={`/order/${event.orderId}`} className="hover:underline">
                          {event.orderReference || event.orderId.slice(0, 8)}
                        </Link>
                      ) : event.quantity ? (
                        `× ${event.quantity}`
                      ) : null}
                      {event.email ? ` · ${event.email}` : event.type === "purchase" ? "" : " · visitor"}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatMoney(event.amountCents)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
