"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { authClient } from "@/lib/auth-client";
import { trackBeginCheckout } from "@/lib/ads/gtag";
import { normalizeZonePhone } from "@/lib/phone";
import { formatPrice } from "@/lib/products/repository";
import { WelcomeCodeMark, WelcomeOfferNote } from "@/components/welcome-offer-note";
import { WELCOME_PROMO, isWelcomePromo, parsePromoCode } from "@/lib/promo";
import {
  SHIPPING_COUNTRIES,
  SHIPPING_OFFERED_SENTENCE,
  isShippingCountry,
  normalizeShippingPostal,
  shippingFieldHints,
  type ShippingCountryCode,
} from "@/lib/shipping-zone";

const DRAFT_KEY = "francemobilier-checkout-v1";

type Draft = {
  name: string;
  email: string;
  line1: string;
  postalCode: string;
  city: string;
  phone: string;
  country: ShippingCountryCode;
  promoCode: string;
};

const emptyDraft: Draft = {
  name: "",
  email: "",
  line1: "",
  postalCode: "",
  city: "",
  phone: "",
  country: "FR",
  promoCode: "",
};

function readDraft(): Partial<Draft> {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Draft>;
    return {
      ...parsed,
      country: parsed.country && isShippingCountry(parsed.country) ? parsed.country : undefined,
      promoCode: typeof parsed.promoCode === "string" ? parsed.promoCode : undefined,
    };
  } catch {
    return {};
  }
}

export function CheckoutForm() {
  const { items, subtotal, itemCount, ready, welcome } = useCart();
  const { data: session } = authClient.useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [hydrated, setHydrated] = useState(false);
  const [pro, setPro] = useState<{ companyName: string; siren: string } | null>(null);
  const hydratedOnce = useRef(false);
  const beginCheckoutSent = useRef(false);
  const hints = useMemo(() => shippingFieldHints(draft.country), [draft.country]);
  const welcomePreview = Boolean(
    !pro && welcome.status === "active" && isWelcomePromo(draft.promoCode),
  );
  const payable = useMemo(() => {
    const subtotalCents = Math.round(subtotal * 100);
    if (!welcomePreview) {
      return { discountCents: 0, total: subtotal };
    }
    const discountCents = Math.round(subtotalCents * (WELCOME_PROMO.percent / 100));
    return { discountCents, total: (subtotalCents - discountCents) / 100 };
  }, [subtotal, welcomePreview]);

  useEffect(() => {
    if (!session?.user) {
      setPro(null);
      return;
    }
    fetch("/api/pro-access")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.request?.status === "approved") {
          setPro({
            companyName: data.request.companyName || data.request.legalName,
            siren: data.request.siren,
          });
        }
      })
      .catch(() => {});
  }, [session?.user]);

  useEffect(() => {
    if (!ready || hydratedOnce.current) return;
    hydratedOnce.current = true;
    const saved = readDraft();
    const fromUrl =
      typeof window !== "undefined"
        ? parsePromoCode(new URLSearchParams(window.location.search).get("code") || "")
        : null;
    const next: Draft = {
      ...emptyDraft,
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      ...saved,
      promoCode: fromUrl || saved.promoCode || WELCOME_PROMO.code,
    };
    setDraft(next);
    if (next.line1 && next.phone && next.postalCode) {
      setHydrated(true);
      return;
    }
    fetch("/api/checkout")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const last = data?.lastDelivery;
        if (!last) return;
        setDraft((current) => ({
          ...current,
          name: current.name || last.name || "",
          email: current.email || last.email || "",
          line1: current.line1 || last.line1 || "",
          postalCode: current.postalCode || last.postalCode || "",
          city: current.city || last.city || "",
          phone: current.phone || last.phone || "",
          country:
            last.country && isShippingCountry(last.country) && !saved.country
              ? last.country
              : current.country,
        }));
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, [ready, session?.user?.email, session?.user?.name]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* private mode */
    }
  }, [draft, hydrated]);

  useEffect(() => {
    if (!hydrated || pro) return;
    if (welcome.status === "active") {
      setDraft((current) =>
        isWelcomePromo(current.promoCode) ? current : { ...current, promoCode: WELCOME_PROMO.code },
      );
      return;
    }
    if (welcome.status === "expired") {
      setDraft((current) =>
        isWelcomePromo(current.promoCode) ? { ...current, promoCode: "" } : current,
      );
    }
  }, [hydrated, pro, welcome.status]);

  useEffect(() => {
    if (!ready || !hydrated || itemCount < 1 || beginCheckoutSent.current) return;
    beginCheckoutSent.current = true;
    trackBeginCheckout({ valueEur: payable.total, itemCount });
  }, [ready, hydrated, itemCount, payable.total]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  if (!ready) {
    return <div className="min-h-48" />;
  }

  if (itemCount === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <p className="text-muted">Votre panier est vide.</p>
        <Link href="/collections/meubles" className="btn btn-primary mt-6 inline-flex">
          Voir la sélection
        </Link>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const postalCode = normalizeShippingPostal(draft.country, draft.postalCode);
    if (!postalCode) {
      setError("Code postal invalide pour le pays choisi.");
      return;
    }
    const phone = normalizeZonePhone(draft.phone, draft.country);
    if (!phone) {
      setError("Indiquez un numéro valide (France, Belgique, Luxembourg, Monaco ou Suisse).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          name: draft.name,
          email: draft.email,
          line1: draft.line1,
          country: draft.country,
          postalCode,
          city: draft.city,
          phone,
          promoCode: pro || welcome.status !== "active" ? undefined : draft.promoCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Paiement impossible");
      trackBeginCheckout({ valueEur: payable.total, itemCount });
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]" onSubmit={onSubmit}>
      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="text-lg font-medium">Livraison</h2>
        <p className="text-sm text-muted">
          Une seule étape ici. Le paiement carte, Apple Pay ou Google Pay s’ouvre ensuite sur Stripe.
        </p>
        {pro ? (
          <p className="rounded-xl bg-cream px-4 py-3 text-sm leading-relaxed text-navy">
            Compte professionnel — {pro.companyName} (SIREN {pro.siren}). Cette commande porte le
            nom de l’entreprise. Les prix restent TTC.
          </p>
        ) : null}
        <label className="block text-sm">
          Pays
          <select
            required
            name="country"
            autoComplete="country"
            value={draft.country}
            onChange={(event) => update("country", event.target.value as ShippingCountryCode)}
            className="input mt-1"
          >
            {SHIPPING_COUNTRIES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Nom
          <input
            required
            name="name"
            autoComplete="name"
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="block text-sm">
          E-mail
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            value={draft.email}
            onChange={(event) => update("email", event.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="block text-sm">
          Adresse
          <input
            required
            name="line1"
            autoComplete="address-line1"
            value={draft.line1}
            onChange={(event) => update("line1", event.target.value)}
            className="input mt-1"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Code postal
            <input
              required
              name="postalCode"
              className="input mt-1"
              autoComplete="postal-code"
              inputMode="numeric"
              placeholder={hints.postal}
              value={draft.postalCode}
              onChange={(event) => update("postalCode", event.target.value)}
            />
          </label>
          <label className="block text-sm">
            Ville
            <input
              required
              name="city"
              autoComplete="address-level2"
              value={draft.city}
              onChange={(event) => update("city", event.target.value)}
              className="input mt-1"
            />
          </label>
        </div>
        <label className="block text-sm">
          Téléphone
          <input
            required
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder={hints.phone}
            maxLength={30}
            value={draft.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="input mt-1"
          />
          <span className="mt-1 block text-xs text-muted">
            Pour la livraison. Exemple : {hints.phone}
          </span>
        </label>
        {pro ? (
          <p className="text-sm text-muted">
            Les tarifs professionnels s’appliquent déjà. Le code BIENVENUE n’est pas cumulable.
          </p>
        ) : welcome.status === "expired" ? (
          <p className="text-sm text-muted">Le délai du code BIENVENUE est écoulé.</p>
        ) : (
          <label className="block text-sm">
            Code promo
            <input
              name="promoCode"
              autoComplete="off"
              spellCheck={false}
              placeholder="BIENVENUE"
              maxLength={20}
              value={draft.promoCode}
              onChange={(event) => update("promoCode", event.target.value.toUpperCase())}
              className="input mt-1"
            />
            <WelcomeOfferNote className="mt-3" />
          </label>
        )}
        {draft.country === "CH" ? (
          <p className="text-sm text-muted">
            En Suisse, des droits ou taxes d’importation peuvent s’ajouter à la réception. Ils ne
            sont pas inclus dans le prix payé ici.
          </p>
        ) : null}
      </div>
      <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="text-lg font-medium">Récapitulatif</h2>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={`${item.productId}-${item.variantId ?? "default"}`} className="flex justify-between gap-3">
              <span className="min-w-0 break-words">
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="flex justify-between text-sm text-muted">
          <span>Livraison</span>
          <span>0,00 €</span>
        </p>
        {welcomePreview ? (
          <p className="flex justify-between text-sm">
            <span>
              <WelcomeCodeMark />
            </span>
            <span className="text-[var(--promo-green)]">
              −{formatPrice(payable.discountCents / 100)}
            </span>
          </p>
        ) : null}
        <p className="flex justify-between border-t border-border pt-3 font-medium">
          <span>Total TTC</span>
          <span>{formatPrice(payable.total)}</span>
        </p>
        <p className="text-sm text-muted">{SHIPPING_OFFERED_SENTENCE}</p>
        <p className="text-xs text-muted">
          Pas de compte obligatoire. Paiement sécurisé par Stripe (carte, Apple Pay, Google Pay).
        </p>
        <p className="text-xs text-muted">
          <Link href="/livraison" className="underline-offset-4 hover:underline">
            Livraison
          </Link>
          {" · "}
          <Link href="/retours" className="underline-offset-4 hover:underline">
            Retours
          </Link>
          {" · "}
          <Link href="/cgv" className="underline-offset-4 hover:underline">
            CGV
          </Link>
        </p>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Ouverture du paiement…" : `Payer ${formatPrice(payable.total)}`}
        </button>
        <Link href="/panier" className="block text-center text-sm text-muted underline-offset-4 hover:underline">
          Retour au panier
        </Link>
      </aside>
    </form>
  );
}
