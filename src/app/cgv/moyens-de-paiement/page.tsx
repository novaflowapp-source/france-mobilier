import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessIdentity } from "@/lib/business/identity";
import { PAYMENT_METHODS_PATH, paymentMethodHref, paymentMethods } from "@/lib/payment-methods";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata(PAYMENT_METHODS_PATH, {
  title: "Moyens de paiement",
  description:
    "Visa, Mastercard, Cartes Bancaires, Apple Pay et Google Pay : comment payer une commande France Mobilier.",
});

export default function PaymentMethodsIndexPage() {
  const identity = getBusinessIdentity();

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="text-navy underline-offset-4 hover:underline">
          Accueil
        </Link>
        {" / "}
        <Link href="/cgv" className="text-navy underline-offset-4 hover:underline">
          CGV
        </Link>
        {" / "}
        <span className="text-foreground">Moyens de paiement</span>
      </nav>
      <h1 className="text-3xl font-semibold tracking-tight">Moyens de paiement</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Cette catégorie des{" "}
        <Link href="/cgv" className="text-navy underline-offset-4 hover:underline">
          conditions générales de vente
        </Link>{" "}
        décrit les moyens de paiement proposés sur {identity.storeName}. Le paiement est traité par
        Stripe. {identity.legalName} n’enregistre pas le numéro complet de votre carte.
      </p>
      <ul className="mt-8 space-y-3">
        {paymentMethods.map((method) => (
          <li key={method.slug}>
            <Link
              href={paymentMethodHref(method.slug)}
              className="block rounded-xl border border-border bg-white px-4 py-4 transition hover:border-navy/30"
            >
              <p className="font-semibold text-navy">{method.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{method.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
