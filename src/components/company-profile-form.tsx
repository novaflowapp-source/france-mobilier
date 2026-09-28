"use client";

import { FormEvent, useState } from "react";
import { SHIPPING_COUNTRIES, type ShippingCountryCode } from "@/lib/shipping-zone";

type Profile = {
  companyName: string;
  legalName: string;
  siren: string;
  vatNumber: string | null;
  phone: string | null;
  website: string | null;
  billingLine1: string | null;
  billingLine2: string | null;
  postalCode: string | null;
  city: string | null;
  country: string | null;
  firstName: string | null;
  lastName: string | null;
  activity: string | null;
  status: string;
};

export function CompanyProfileForm({ initial }: { initial: Profile }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setOk(false);
    setLoading(true);
    try {
      const res = await fetch("/api/pro-access/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      if (data.request?.status && data.request.status !== "approved") {
        window.location.reload();
        return;
      }
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-white p-6">
      <p className="text-sm text-muted">
        Changing a French SIREN is re-verified automatically. Outside France, access goes through
        manual review.
      </p>
      <label className="block text-sm">
        Legal business name
        <input className="input mt-1" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
      </label>
      <label className="block text-sm">
        SIREN
        <input
          className="input mt-1"
          inputMode="numeric"
          autoComplete="off"
          value={form.siren}
          onChange={(e) => set("siren", e.target.value)}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          First name
          <input className="input mt-1" value={form.firstName || ""} onChange={(e) => set("firstName", e.target.value)} />
        </label>
        <label className="block text-sm">
          Last name
          <input className="input mt-1" value={form.lastName || ""} onChange={(e) => set("lastName", e.target.value)} />
        </label>
      </div>
      <label className="block text-sm">
        Phone
        <input className="input mt-1" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} />
      </label>
      <label className="block text-sm">
        VAT
        <input className="input mt-1" value={form.vatNumber || ""} onChange={(e) => set("vatNumber", e.target.value)} />
      </label>
      <label className="block text-sm">
        Address
        <input className="input mt-1" value={form.billingLine1 || ""} onChange={(e) => set("billingLine1", e.target.value)} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          ZIP code
          <input className="input mt-1" value={form.postalCode || ""} onChange={(e) => set("postalCode", e.target.value)} />
        </label>
        <label className="block text-sm">
          City
          <input className="input mt-1" value={form.city || ""} onChange={(e) => set("city", e.target.value)} />
        </label>
      </div>
      <label className="block text-sm">
        Country
        <select
          className="input mt-1"
          value={form.country || "US"}
          onChange={(e) => set("country", e.target.value as ShippingCountryCode)}
        >
          {SHIPPING_COUNTRIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {ok ? <p className="text-sm text-navy">Saved.</p> : null}
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
