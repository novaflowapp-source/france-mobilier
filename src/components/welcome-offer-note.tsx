"use client";

import { useCart } from "@/components/cart-provider";
import { formatWelcomeCountdown } from "@/lib/welcome-offer";

export function WelcomeCodeMark({
  onDark = false,
  className = "",
}: {
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`font-semibold ${
        onDark ? "text-[var(--promo-green-on-navy)]" : "text-[var(--promo-green)]"
      } ${className}`}
    >
      Code BIENVENUE −10%
    </span>
  );
}

export function WelcomeRemaining({ remainingMs }: { remainingMs: number }) {
  return (
    <span className="whitespace-nowrap">
      code valable encore{" "}
      <span className="tabular-nums font-semibold">{formatWelcomeCountdown(remainingMs)}</span>
    </span>
  );
}

export function WelcomeOfferNote({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const { welcome } = useCart();
  if (welcome.status === "expired") return null;

  const remaining =
    welcome.status === "active" ? <WelcomeRemaining remainingMs={welcome.remainingMs} /> : null;

  return (
    <div className={`welcome-offer-lift ${className}`.trim()}>
      <div className="welcome-offer-card">
        <p className={`welcome-offer-card-inner${compact ? " is-compact" : ""}`}>
          {compact ? (
            <>
              <WelcomeCodeMark />
              {remaining ? <> · {remaining}</> : null}
            </>
          ) : (
            <>
              <WelcomeCodeMark /> sur votre première commande
              {remaining ? <> · {remaining}</> : null}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
