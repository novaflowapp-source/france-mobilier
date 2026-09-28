"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { OrderSummary } from "@/components/order-summary";
import { CopyTextButton } from "@/components/copy-text-button";
import type { PublicOrder } from "@/lib/orders";

export function AccountOrders({ signedIn }: { signedIn: boolean }) {
  const [orders, setOrders] = useState<PublicOrder[] | null>(null);
  const [guestAccount, setGuestAccount] = useState<{ email: string; password: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]));
  }, []);

  async function onLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") || ""),
          postalCode: String(form.get("postalCode") || ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      setOrders(data.orders || []);
      setGuestAccount(data.guestAccount || null);
      if ((data.orders || []).length === 0) {
        setError("No paid orders found for this email and ZIP code.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-w-0 space-y-4" id="orders">
      <h2 className="text-xl font-semibold tracking-tight">Orders</h2>
      {!signedIn ? (
        <p className="text-sm leading-relaxed text-muted">
          Without an account, find an order with the email and ZIP used at checkout. An account with
          the same email shows them automatically afterward.
        </p>
      ) : null}

      {guestAccount ? (
        <div className="rounded-2xl border border-navy/20 bg-cream p-4 sm:p-5">
          <p className="font-medium text-navy">Account created for this email</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Sign-in email: <span className="font-medium text-navy">{guestAccount.email}</span>
            <br />
            <span className="mt-1 inline-flex flex-wrap items-center gap-2">
              Temporary password:{" "}
              <span className="font-medium text-navy">{guestAccount.password}</span>
              <CopyTextButton text={guestAccount.password} />
            </span>
          </p>
          <Link href="/login?next=%2Fcompte%23password" className="btn btn-secondary mt-4 inline-flex">
            Sign in
          </Link>
        </div>
      ) : null}

      {orders && orders.length > 0 ? (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderSummary order={order} href={`/order/${order.id}`} />
            </li>
          ))}
        </ul>
      ) : orders ? (
        <p className="text-sm text-muted">
          {signedIn ? "No paid orders are linked to this account yet." : null}
        </p>
      ) : (
        <p className="text-sm text-muted">Loading orders…</p>
      )}

      <form className="space-y-3 rounded-2xl border border-border bg-white p-4 sm:p-5" onSubmit={onLookup}>
        <p className="text-sm font-medium text-navy">Find an order</p>
        <label className="block text-sm">
          Email
          <input required type="email" name="email" autoComplete="email" className="input mt-1" />
        </label>
        <label className="block text-sm">
          ZIP code
          <input
            required
            name="postalCode"
            autoComplete="postal-code"
            inputMode="numeric"
            className="input mt-1"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={loading} className="btn btn-primary w-full sm:w-auto">
          {loading ? "Searching…" : "Show orders"}
        </button>
      </form>

      {!signedIn ? (
        <p className="text-sm text-muted">
          <Link href="/login" className="text-accent underline-offset-2 hover:underline">
            Sign in
          </Link>
          {" · "}
          <Link href="/signup" className="text-accent underline-offset-2 hover:underline">
            Create account
          </Link>
        </p>
      ) : null}
    </section>
  );
}
