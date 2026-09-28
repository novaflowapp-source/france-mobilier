import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusinessIdentity } from "@/lib/business/identity";
import { getReturnPolicy } from "@/lib/business/policies";
import {
  PAYMENT_METHODS_PATH,
  getPaymentMethod,
  paymentMethodHref,
  paymentMethods,
} from "@/lib/payment-methods";
import { indexableMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return paymentMethods.map((method) => ({ slug: method.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const method = getPaymentMethod(slug);
  if (!method) return {};
  return indexableMetadata(paymentMethodHref(method.slug), {
    title: `${method.title} — terms`,
    description: method.description,
  });
}

export default async function PaymentMethodPage({ params }: Props) {
  const { slug } = await params;
  const method = getPaymentMethod(slug);
  if (!method) notFound();

  const identity = getBusinessIdentity();
  const returns = getReturnPolicy();

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
        <Link href={PAYMENT_METHODS_PATH} className="text-navy underline-offset-4 hover:underline">
          Payment methods
        </Link>
        {" / "}
        <span className="text-foreground">{method.name}</span>
      </nav>
      <h1 className="text-3xl font-semibold tracking-tight">{method.title}</h1>
      <div className="mt-6 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-xl font-semibold text-navy">Overview</h2>
          <p className="mt-3">{method.summary}</p>
          <p className="mt-3">
            Payment for {identity.storeName} orders is processed by Stripe. Your order is confirmed
            only after payment succeeds. The amount charged is the USD total shown at checkout.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">How it works</h2>
          <p className="mt-3">{method.how}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">Availability</h2>
          <p className="mt-3">{method.availability}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">Security & data</h2>
          <p className="mt-3">
            {identity.legalName} does not store your full card number or wallet credentials. Stripe
            collects and processes that data under its{" "}
            <a
              href="https://stripe.com/privacy"
              className="text-navy underline-offset-4 hover:underline"
              rel="noreferrer"
              target="_blank"
            >
              privacy policy
            </a>
            . Order data handling is described in our{" "}
            <Link href="/privacy" className="text-navy underline-offset-4 hover:underline">
              privacy policy
            </Link>
            .
          </p>
          {method.extraTerms ? <p className="mt-3">{method.extraTerms}</p> : null}
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">Refunds</h2>
          <p className="mt-3">
            Refunds go back to the same payment method, under the rules on{" "}
            <Link href="/returns" className="text-navy underline-offset-4 hover:underline">
              Returns & refunds
            </Link>
            , within {returns.refundProcessingMaxDays} days after we receive the return or required
            proof. These rules are part of our{" "}
            <Link href="/terms" className="text-navy underline-offset-4 hover:underline">
              terms of sale
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
