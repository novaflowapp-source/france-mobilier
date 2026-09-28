"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { PRO_ACTIVITY_TYPES, PRO_VOLUME_OPTIONS } from "@/lib/b2b";
import { SHIPPING_COUNTRIES, type ShippingCountryCode } from "@/lib/shipping-zone";

type RequestState = {
  siren: string;
  siret: string | null;
  companyName: string;
  legalName: string;
  city: string | null;
  status: "pending" | "approved" | "rejected" | "suspended" | "eligible";
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  country?: string | null;
};

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return { firstName: full, lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.at(-1) || "" };
}

export function ProAccessForm() {
  const pathname = usePathname();
  const next = pathname?.startsWith("/account") ? "/account/company" : "/trade";
  const { data: session, isPending } = authClient.useSession();
  const [existing, setExisting] = useState<RequestState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seeded = splitName(session?.user?.name || "");
  const [firstName, setFirstName] = useState(seeded.firstName);
  const [lastName, setLastName] = useState(seeded.lastName);
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState<ShippingCountryCode>("US");
  const [billingLine1, setBillingLine1] = useState("");
  const [billingLine2, setBillingLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [siren, setSiren] = useState("");
  const [siret, setSiret] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [activity, setActivity] = useState("");
  const [activityOther, setActivityOther] = useState("");
  const [expectedOrderVolume, setExpectedOrderVolume] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!session?.user) return;
    const parts = splitName(session.user.name || "");
    setFirstName((current) => current || parts.firstName);
    setLastName((current) => current || parts.lastName);
    fetch("/api/pro-access")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.request) setExisting(data.request);
      })
      .catch(() => {});
  }, [session?.user]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/pro-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          companyName,
          country,
          billingLine1,
          billingLine2: billingLine2 || undefined,
          postalCode,
          city,
          siren: siren || undefined,
          siret: siret || undefined,
          vatNumber: vatNumber || undefined,
          website: website || undefined,
          activity: activity || undefined,
          activityOther: activity === "autre" ? activityOther : undefined,
          expectedOrderVolume: expectedOrderVolume || undefined,
          message: message || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed. Try again later.");
      setExisting(data.request);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  if (isPending) return <p className="text-muted">Loading…</p>;

  if (!session?.user) {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-white p-6">
        <p className="leading-relaxed text-muted">
          Sign in with your usual account. Your email and password stay the same.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="btn btn-primary w-full sm:w-auto">
            Sign in
          </Link>
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="btn btn-secondary w-full sm:w-auto">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  if (existing) {
    const copy = {
      approved: {
        title: "Trade access enabled",
        body: "You can order under your company name, download invoices, and request quotes.",
      },
      pending: {
        title: "Your trade application is under review.",
        body: "You’ll get an email when access is approved.",
      },
      eligible: {
        title: "Your trade application is under review.",
        body: "You’ll get an email when access is approved.",
      },
      rejected: {
        title: "Your application could not be approved.",
        body: "Contact us if you need more information.",
      },
      suspended: {
        title: "Your trade access is temporarily unavailable.",
        body: "Personal orders are still available. Contact us to learn more.",
      },
    }[existing.status] || {
      title: "Application saved",
      body: "",
    };

    return (
      <div className="rounded-[var(--radius)] border border-border bg-white p-6">
        <p className="text-sm font-medium text-navy">{copy.title}</p>
        <p className="mt-3 text-sm text-muted">{existing.legalName || existing.companyName}</p>
        {existing.siren ? <p className="mt-1 text-sm text-muted">SIREN {existing.siren}</p> : null}
        {existing.city ? <p className="mt-1 text-sm text-muted">{existing.city}</p> : null}
        {copy.body ? <p className="mt-4 text-sm leading-relaxed text-muted">{copy.body}</p> : null}
        {existing.status === "rejected" ? (
          <button type="button" className="btn btn-secondary mt-6" onClick={() => setExisting(null)}>
            Edit application
          </button>
        ) : null}
      </div>
    );
  }

  const french = false;

  return (
    <form onSubmit={onSubmit} className="space-y-8 rounded-[var(--radius)] border border-border bg-white p-6">
      <p className="text-sm text-muted">
        Account: {session.user.email}. Your email and password stay the same.
      </p>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-navy">Your details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            First name
            <input
              required
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input mt-1"
            />
          </label>
          <label className="block text-sm">
            Last name
            <input
              required
              name="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="input mt-1"
            />
          </label>
        </div>
        <label className="block text-sm">
          Work email
          <input readOnly autoComplete="email" value={session.user.email} className="input mt-1 bg-cream" />
        </label>
        <label className="block text-sm">
          Phone
          <input
            required
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input mt-1"
          />
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-navy">Your company</legend>
        <label className="block text-sm">
          Legal business name
          <input
            required
            name="organization"
            autoComplete="organization"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="block text-sm">
          Country
          <select
            name="country"
            autoComplete="country"
            value={country}
            onChange={(e) => setCountry(e.target.value as ShippingCountryCode)}
            className="input mt-1"
          >
            {SHIPPING_COUNTRIES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        {french ? (
          <>
            <label className="block text-sm">
              SIREN
              <input
                required
                name="siren"
                inputMode="numeric"
                autoComplete="off"
                value={siren}
                onChange={(e) => setSiren(e.target.value)}
                className="input mt-1"
              />
            </label>
            <label className="block text-sm">
              SIRET <span className="text-muted">(optional)</span>
              <input
                name="siret"
                inputMode="numeric"
                autoComplete="off"
                value={siret}
                onChange={(e) => setSiret(e.target.value)}
                className="input mt-1"
              />
            </label>
          </>
        ) : (
          <p className="text-sm text-muted">
            Without a French SIRET, we review applications manually. A SIREN is not required.
          </p>
        )}
        <label className="block text-sm">
          Billing address
          <input
            required
            name="street-address"
            autoComplete="street-address"
            value={billingLine1}
            onChange={(e) => setBillingLine1(e.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="block text-sm">
          Address line 2 <span className="text-muted">(optional)</span>
          <input
            name="address-line2"
            autoComplete="address-line2"
            value={billingLine2}
            onChange={(e) => setBillingLine2(e.target.value)}
            className="input mt-1"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            ZIP code
            <input
              required
              name="postal-code"
              autoComplete="postal-code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="input mt-1"
            />
          </label>
          <label className="block text-sm">
            City
            <input
              required
              name="address-level2"
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input mt-1"
            />
          </label>
        </div>
        <label className="block text-sm">
          VAT number <span className="text-muted">(optional)</span>
          <input
            name="vatNumber"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="block text-sm">
          Website <span className="text-muted">(optional)</span>
          <input
            name="url"
            type="url"
            autoComplete="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="input mt-1"
          />
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-navy">Your project</legend>
        <label className="block text-sm">
          Business type <span className="text-muted">(optional)</span>
          <select
            name="activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="input mt-1"
          >
            <option value="">Select</option>
            {PRO_ACTIVITY_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        {activity === "autre" ? (
          <label className="block text-sm">
            Please specify
            <input
              name="activityOther"
              value={activityOther}
              onChange={(e) => setActivityOther(e.target.value)}
              className="input mt-1"
            />
          </label>
        ) : null}
        <label className="block text-sm">
          Estimated purchase volume <span className="text-muted">(optional, does not change pricing)</span>
          <select
            name="volume"
            value={expectedOrderVolume}
            onChange={(e) => setExpectedOrderVolume(e.target.value)}
            className="input mt-1"
          >
            <option value="">Select</option>
            {PRO_VOLUME_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Notes <span className="text-muted">(optional)</span>
          <textarea
            name="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input mt-1"
          />
        </label>
      </fieldset>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={loading}>
        {loading ? "Sending…" : french ? "Submit application" : "Submit for review"}
      </button>
    </form>
  );
}
