import type { Metadata } from "next";
import Link from "next/link";
import { formatPublicAddress, getBusinessIdentity } from "@/lib/business/identity";
import { getReturnPolicy, getShippingPolicy } from "@/lib/business/policies";
import { getDefaultDeliveryProfile } from "@/lib/merchant/delivery";
import { PAYMENT_METHODS_PATH, paymentMethodHref, paymentMethods } from "@/lib/payment-methods";
import { indexableMetadata } from "@/lib/seo";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

export const metadata: Metadata = indexableMetadata("/terms", {
  title: "Terms of sale",
});

export default function TermsPage() {
  const identity = getBusinessIdentity();
  const returns = getReturnPolicy();
  const shipping = getShippingPolicy();
  const delivery = getDefaultDeliveryProfile();
  const address = formatPublicAddress(identity);

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of sale</h1>
      <div className="mt-6 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-xl font-semibold text-navy">1. Seller</h2>
          <p className="mt-3">{identity.relationship}</p>
          <p className="mt-2">
            {identity.legalName}, {identity.legalForm}. {identity.registration}.
            {address ? ` Registered office: ${address}.` : ""} Contact: {identity.email}
            {identity.phone ? ` — ${identity.phone}` : ""}. The seller is established in France and
            is not a U.S. corporation.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">2. These terms</h2>
          <p className="mt-3">
            These terms apply to furniture and accessory sales on {identity.storeName} (
            {identity.domain}) to customers in the United States. By placing an order you agree to
            them.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">3. Products</h2>
          <p className="mt-3">
            Essential characteristics are on the product page. A “made to order” item is a standard
            model whose production starts after payment, unless the page says it is customized to
            your specifications.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">4. Prices and tax</h2>
          <p className="mt-3">
            Prices are shown in U.S. dollars. The amount due is the amount displayed when you pay,
            plus any sales tax we are required to collect for your state. Trade terms, if any, do
            not replace the public price. Code WELCOME is 10% off the first order (entire cart,
            not combined with a trade price). It may be used once per person, identified by the
            phone number entered at checkout; a number already tied to an order or account cannot
            reuse it.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">5. Orders and payment</h2>
          <p className="mt-3">
            The order is firm after payment is confirmed. Payment is processed by Stripe. Available
            methods (card, Apple Pay, Google Pay, depending on your device) are described under{" "}
            <Link href={PAYMENT_METHODS_PATH} className="text-navy underline-offset-4 hover:underline">
              Payment methods
            </Link>
            . An account is not required before purchase; we may create customer access after
            payment.
          </p>
        </section>
        <section id="payment-methods" className="scroll-mt-28">
          <h2 className="text-xl font-semibold text-navy">6. Payment methods</h2>
          <p className="mt-3">
            The following pages form part of these terms. They explain each payment method accepted
            on {identity.storeName}:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {paymentMethods.map((method) => (
              <li key={method.slug}>
                <Link
                  href={paymentMethodHref(method.slug)}
                  className="text-navy underline-offset-4 hover:underline"
                >
                  {method.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">7. Availability</h2>
          <p className="mt-3">
            Only products marked available can be ordered. An item marked “coming soon” cannot be
            purchased.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">8. Shipping</h2>
          <p className="mt-3">
            {SHIPPING_OFFERED_SENTENCE} Cost: ${shipping.shippingCostUsd.toFixed(2)}. Preparation: 1
            week ({delivery.handlingMinBusinessDays} business days). Transit:{" "}
            {delivery.transitMinBusinessDays} business days after shipment. We email you at the end
            of preparation, then at shipment. A tracking number is sent only when available. We do
            not ship to Alaska, Hawaii, U.S. territories, or outside the contiguous United States.
            Import duties, if charged on an international shipment, are not included unless they
            appear in the checkout total.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">9. Delivery</h2>
          <p className="mt-3">
            Check the package on arrival. If damage is visible, note it with the carrier if possible
            and contact us with photos.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">10. Returns and refunds</h2>
          <p className="mt-3">
            You may return unused items within {returns.returnWindowDays} days of delivery under our
            store policy. How to return, exclusions, and refunds are on{" "}
            <Link href="/returns" className="text-navy underline-offset-4 hover:underline">
              Returns and refunds
            </Link>
            .
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">11. Damaged goods</h2>
          <p className="mt-3">
            If an item arrives damaged, is defective, or does not match the order, contact{" "}
            {identity.email}. We will arrange a replacement, repair, or refund as appropriate.
            Nothing here limits rights that cannot be waived under the consumer-protection laws of
            your state of residence.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">12. Customer service</h2>
          <p className="mt-3">
            {identity.email}
            {identity.phone ? ` — ${identity.phone}` : ""}. {identity.hours}.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">13. Privacy</h2>
          <p className="mt-3">
            How we use personal information is described in the{" "}
            <Link href="/privacy" className="text-navy underline-offset-4 hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">14. Governing law and disputes</h2>
          <p className="mt-3">
            These terms are governed by the laws of France, where the seller is established, without
            prejudice to mandatory consumer-protection rules of your U.S. state of residence that
            cannot be waived. Contact {identity.email} first if there is a dispute.
          </p>
        </section>
      </div>
    </div>
  );
}
