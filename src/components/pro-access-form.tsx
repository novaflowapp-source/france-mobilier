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
  const next = pathname?.startsWith("/compte") ? "/compte/entreprise" : "/professionnels";
  const { data: session, isPending } = authClient.useSession();
  const [existing, setExisting] = useState<RequestState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seeded = splitName(session?.user?.name || "");
  const [firstName, setFirstName] = useState(seeded.firstName);
  const [lastName, setLastName] = useState(seeded.lastName);
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState<ShippingCountryCode>("FR");
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
      if (!res.ok) throw new Error(data.error || "Demande impossible pour le moment.");
      setExisting(data.request);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demande impossible pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  if (isPending) return <p className="text-muted">Chargement…</p>;

  if (!session?.user) {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-white p-6">
        <p className="leading-relaxed text-muted">
          Connectez-vous avec votre compte habituel. L’e-mail et le mot de passe ne changent pas.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={`/connexion?next=${encodeURIComponent(next)}`} className="btn btn-primary w-full sm:w-auto">
            Se connecter
          </Link>
          <Link href={`/inscription?next=${encodeURIComponent(next)}`} className="btn btn-secondary w-full sm:w-auto">
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  if (existing) {
    const copy = {
      approved: {
        title: "Accès professionnel activé",
        body: "Vous pouvez commander au nom de l’entreprise, télécharger vos factures et demander un devis.",
      },
      pending: {
        title: "Votre demande professionnelle est en cours de vérification.",
        body: "Vous recevrez un e-mail lorsque l’accès sera activé.",
      },
      eligible: {
        title: "Votre demande professionnelle est en cours de vérification.",
        body: "Vous recevrez un e-mail lorsque l’accès sera activé.",
      },
      rejected: {
        title: "Votre demande n’a pas pu être validée.",
        body: "Contactez-nous si vous souhaitez obtenir davantage d’informations.",
      },
      suspended: {
        title: "Votre accès professionnel est temporairement indisponible.",
        body: "Les commandes particulières restent possibles. Contactez-nous pour en savoir plus.",
      },
    }[existing.status] || {
      title: "Demande enregistrée",
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
            Modifier la demande
          </button>
        ) : null}
      </div>
    );
  }

  const french = country === "FR" || country === "MC";

  return (
    <form onSubmit={onSubmit} className="space-y-8 rounded-[var(--radius)] border border-border bg-white p-6">
      <p className="text-sm text-muted">
        Compte : {session.user.email}. L’e-mail et le mot de passe ne changent pas.
      </p>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-navy">Vos coordonnées</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Prénom
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
            Nom
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
          E-mail professionnel
          <input readOnly autoComplete="email" value={session.user.email} className="input mt-1 bg-cream" />
        </label>
        <label className="block text-sm">
          Téléphone
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
        <legend className="text-sm font-medium text-navy">Votre entreprise</legend>
        <label className="block text-sm">
          Raison sociale
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
          Pays
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
              SIRET <span className="text-muted">(optionnel)</span>
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
            Sans SIRET français, la demande est examinée manuellement. Un SIREN n’est pas exigé.
          </p>
        )}
        <label className="block text-sm">
          Adresse de facturation
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
          Complément <span className="text-muted">(optionnel)</span>
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
            Code postal
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
            Ville
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
          N° TVA intracommunautaire <span className="text-muted">(optionnel)</span>
          <input
            name="vatNumber"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="block text-sm">
          Site internet <span className="text-muted">(optionnel)</span>
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
        <legend className="text-sm font-medium text-navy">Votre projet</legend>
        <label className="block text-sm">
          Activité <span className="text-muted">(optionnel)</span>
          <select
            name="activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="input mt-1"
          >
            <option value="">Choisir</option>
            {PRO_ACTIVITY_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        {activity === "autre" ? (
          <label className="block text-sm">
            Précisez
            <input
              name="activityOther"
              value={activityOther}
              onChange={(e) => setActivityOther(e.target.value)}
              className="input mt-1"
            />
          </label>
        ) : null}
        <label className="block text-sm">
          Volume d’achat estimé <span className="text-muted">(optionnel, sans effet sur les tarifs)</span>
          <select
            name="volume"
            value={expectedOrderVolume}
            onChange={(e) => setExpectedOrderVolume(e.target.value)}
            className="input mt-1"
          >
            <option value="">Choisir</option>
            {PRO_VOLUME_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Commentaire <span className="text-muted">(optionnel)</span>
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
        {loading ? "Envoi…" : french ? "Envoyer la demande" : "Envoyer pour vérification"}
      </button>
    </form>
  );
}
