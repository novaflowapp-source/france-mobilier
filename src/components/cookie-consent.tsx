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
        We use cookies and local storage needed to run the store: account, cart, order access, and
        checkout. If you accept, Google Ads can also measure ad campaigns. No advertising cookies are
        set without your consent.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        You can accept all cookies, or decline non-essential ones — the site still works.{" "}
        <Link href="/privacy#cookies" className="text-navy underline-offset-2 hover:underline">
          Learn more
        </Link>
        .
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" className="btn btn-secondary w-full" onClick={() => decide(false)}>
          Decline all
        </button>
        <button type="button" className="btn btn-primary w-full" onClick={() => decide(true)}>
          Accept all
        </button>
      </div>
    </div>
  );
}
