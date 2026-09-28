"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { OrderSummary } from "@/components/order-summary";
import { CopyTextButton } from "@/components/copy-text-button";
import { formatPrice } from "@/lib/products/repository";
import { trackPurchaseConversion } from "@/lib/ads/gtag";
import type { PublicOrder } from "@/lib/orders";
import { buildOrderFulfillment, fulfillmentCustomerLabel } from "@/lib/orders/fulfillment";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

type CheckoutOrder = {
  id: string;
  reference: string | null;
  name: string;
  email: string;
  phone: string | null;
  line1: string;
  postalCode: string;
  city: string;
  country?: string;
  amountCents: number;
  confirmationSent: boolean;
  companyName?: string | null;
  siren?: string | null;
  promoCode?: string | null;
  promoDiscountCents?: number;
  fulfillment?: PublicOrder["fulfillment"];
  fulfillmentLabel?: string;
  items: { name: string; quantity: number; unitPriceCents: number }[];
};

export function OrderConfirmation() {
  const searchParams = useSearchParams();
  const { clear } = useCart();
  const [state, setState] = useState<"loading" | "paid" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [accountPassword, setAccountPassword] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setState("error");
      return;
    }
    fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.paid) {
          setState("paid");
          setEmail(data.email || null);
          setAmountCents(typeof data.amountCents === "number" ? data.amountCents : null);
          setOrder(data.order || null);
          setConfirmationSent(Boolean(data.order?.confirmationSent));
          setAccountPassword(typeof data.accountPassword === "string" ? data.accountPassword : null);
          clear();
          const transactionId = String(data.order?.reference || data.order?.id || "").trim();
          const paidCents =
            typeof data.order?.amountCents === "number"
              ? data.order.amountCents
              : typeof data.amountCents === "number"
                ? data.amountCents
                : null;
          if (data.mode !== "test" && transactionId && paidCents != null) {
            trackPurchaseConversion({
              transactionId,
              valueEur: paidCents / 100,
              newCustomer: Boolean(data.newCustomer),
            });
          }
        } else setState("error");
      })
      .catch(() => setState("error"));
  }, [searchParams, clear]);

  if (state === "loading") {
    return <p className="text-muted">Confirming payment…</p>;
  }

  if (state === "error") {
    return (
      <div>
        <p className="text-muted">We couldn’t confirm this payment.</p>
        <Link href="/checkout" className="btn btn-primary mt-6 inline-flex">
          Back to checkout
        </Link>
      </div>
    );
  }

  const summary: PublicOrder | null = order
    ? {
        id: order.id,
        reference: order.reference || order.id.slice(0, 8).toUpperCase(),
        status: "paid",
        email: order.email,
        name: order.name,
        phone: order.phone,
        line1: order.line1,
        postalCode: order.postalCode,
        city: order.city,
        country: order.country || "US",
        amountCents: order.amountCents,
        currency: "usd",
        paidAt: new Date(),
        createdAt: new Date(),
        confirmationSent,
        companyName: order.companyName || null,
        siren: order.siren || null,
        accountType: order.companyName ? "pro" : "personal",
        promoCode: order.promoCode || null,
        promoDiscountCents: order.promoDiscountCents ?? 0,
        fulfillment: order.fulfillment ?? buildOrderFulfillment({ paidAt: new Date(), createdAt: new Date() }),
        fulfillmentLabel:
          order.fulfillmentLabel ||
          fulfillmentCustomerLabel(
            order.fulfillment ?? buildOrderFulfillment({ paidAt: new Date(), createdAt: new Date() }),
          ),
        items: order.items,
      }
    : null;

  return (
    <div className="max-w-xl space-y-6">
      <p className="leading-relaxed text-muted">
        Payment received
        {amountCents != null ? ` (${formatPrice(amountCents / 100)})` : ""}.
        {confirmationSent && email
          ? ` A confirmation email was sent to ${email}.`
          : email
            ? ` Keep this email (${email}) — use it with your shipping ZIP to find the order in My account.`
            : ""}
      </p>
      {summary ? <OrderSummary order={summary} href={`/order/${summary.id}`} /> : null}
      {accountPassword && email ? (
        <div className="rounded-2xl border border-navy/20 bg-cream p-4 sm:p-5">
          <p className="font-medium text-navy">Your account was created</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Sign-in email: <span className="font-medium text-navy">{email}</span>
            <br />
            <span className="mt-1 inline-flex flex-wrap items-center gap-2">
              Temporary password:{" "}
              <span className="font-medium text-navy">{accountPassword}</span>
              <CopyTextButton text={accountPassword} />
            </span>
          </p>
          <p className="mt-2 text-sm text-muted">
            After signing in, change your password in My account to keep access to your orders.
          </p>
          <Link
            href="/login?next=%2Fcompte%23password"
            className="btn btn-secondary mt-4 inline-flex"
          >
            Sign in
          </Link>
        </div>
      ) : null}
      <p className="text-sm leading-relaxed text-muted">
        {SHIPPING_OFFERED_SENTENCE} We’ll email you when your order is ready, then again when it
        ships. Tracking is sent only when available. View orders anytime in{" "}
        <Link href="/account" className="text-navy underline-offset-2 hover:underline">
          My account
        </Link>
        .
      </p>
      <Link href="/collections/maison" className="btn btn-primary inline-flex">
        Continue shopping
      </Link>
    </div>
  );
}
