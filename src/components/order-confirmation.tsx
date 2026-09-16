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
    return <p className="text-muted">Confirmation du paiement…</p>;
  }

  if (state === "error") {
    return (
      <div>
        <p className="text-muted">Nous n’avons pas pu confirmer ce paiement.</p>
        <Link href="/paiement" className="btn btn-primary mt-6 inline-flex">
          Retour à la commande
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
        country: order.country || "FR",
        amountCents: order.amountCents,
        currency: "eur",
        paidAt: new Date(),
        createdAt: new Date(),
        confirmationSent,
        companyName: order.companyName || null,
        siren: order.siren || null,
        accountType: order.companyName ? "pro" : "personal",
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
        Le règlement a bien été enregistré
        {amountCents != null ? ` (${formatPrice(amountCents / 100)})` : ""}.
        {confirmationSent && email
          ? ` Un e-mail de confirmation a été envoyé à ${email}.`
          : email
            ? ` Conservez cet e-mail (${email}) : il sert à retrouver la commande dans Mon compte, avec le code postal de livraison.`
            : ""}
      </p>
      {summary ? <OrderSummary order={summary} href={`/commande/${summary.id}`} /> : null}
      {accountPassword && email ? (
        <div className="rounded-2xl border border-navy/20 bg-cream p-4 sm:p-5">
          <p className="font-medium text-navy">Votre compte a été créé</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Identifiant : <span className="font-medium text-navy">{email}</span>
            <br />
            <span className="mt-1 inline-flex flex-wrap items-center gap-2">
              Mot de passe provisoire :{" "}
              <span className="font-medium text-navy">{accountPassword}</span>
              <CopyTextButton text={accountPassword} />
            </span>
          </p>
          <p className="mt-2 text-sm text-muted">
            Après connexion, changez-le dans Mon compte. Il permet de retrouver vos commandes.
          </p>
          <Link
            href="/connexion?next=%2Fcompte%23mot-de-passe"
            className="btn btn-secondary mt-4 inline-flex"
          >
            Se connecter
          </Link>
        </div>
      ) : null}
      <p className="text-sm leading-relaxed text-muted">
        {SHIPPING_OFFERED_SENTENCE} Nous vous écrirons à la fin de la préparation, puis à
        l’expédition. Un numéro de suivi n’est envoyé que lorsqu’il est disponible. Retrouvez vos
        commandes à tout moment dans{" "}
        <Link href="/compte" className="text-navy underline-offset-2 hover:underline">
          Mon compte
        </Link>
        .
      </p>
      <Link href="/collections/maison" className="btn btn-primary inline-flex">
        Continuer vos achats
      </Link>
    </div>
  );
}
