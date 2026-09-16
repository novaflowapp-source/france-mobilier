"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconCookie } from "@/components/icons";
import {
  COOKIE_CONSENT_OPEN_EVENT,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/cookie-consent";

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!readCookieConsent()) setOpen(true);
    const onOpen = () => setOpen(true);
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
  }, []);

  if (!open) return null;

  function decide(optional: boolean) {
    writeCookieConsent(optional);
    setOpen(false);
  }

  return (
    <div className="cookie-banner" role="dialog" aria-labelledby="cookie-consent-title" aria-modal="false">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-navy">
          <IconCookie className="h-5 w-5" />
        </span>
        <h2 id="cookie-consent-title" className="text-lg font-semibold tracking-tight text-navy">
          Cookies
        </h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Nous utilisons des cookies et un stockage local nécessaires à la boutique : compte, panier,
        accès aux commandes et paiement. Si vous acceptez, Google Ads mesure aussi les campagnes
        publicitaires. Aucun cookie publicitaire n’est déposé sans votre accord.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Vous pouvez tout accepter, ou refuser les cookies non essentiels — le site reste utilisable.{" "}
        <Link href="/confidentialite#cookies" className="text-navy underline-offset-2 hover:underline">
          En savoir plus
        </Link>
        .
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" className="btn btn-secondary w-full" onClick={() => decide(false)}>
          Tout refuser
        </button>
        <button type="button" className="btn btn-primary w-full" onClick={() => decide(true)}>
          Tout accepter
        </button>
      </div>
    </div>
  );
}
