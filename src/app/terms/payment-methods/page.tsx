import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessIdentity } from "@/lib/business/identity";
import { PAYMENT_METHODS_PATH, paymentMethodHref, paymentMethods } from "@/lib/payment-methods";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata(PAYMENT_METHODS_PATH, {
  title: "Payment methods",
  description:
    "Visa, Mastercard, Cartes Bancaires, Apple Pay, and Google Pay — how to pay for a France Mobilier order.",
});

export default function PaymentMethodsIndexPage() {
  const identity = getBusinessIdentity();

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="text-navy underline-offset-4 hover:underline">
          Home
        </Link>
        {" / "}
        <Link href="/terms" className="text-navy underline-offset-4 hover:underline">
          Terms of sale
        </Link>
        {" / "}
        <span className="text-foreground">Payment methods</span>
      </nav>
      <h1 className="text-3xl font-semibold tracking-tight">Payment methods</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        This section of our{" "}
        <Link href="/terms" className="text-navy underline-offset-4 hover:underline">
          terms of sale
        </Link>{" "}
        describes payment options on {identity.storeName}. Checkout is processed by Stripe.{" "}
        {identity.legalName} does not store your full card number.
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
