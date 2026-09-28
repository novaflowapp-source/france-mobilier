import type { Metadata } from "next";
import Link from "next/link";
import { getShippingPolicy } from "@/lib/business/policies";
import { getDefaultDeliveryProfile } from "@/lib/merchant/delivery";
import { indexableMetadata } from "@/lib/seo";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

export const metadata: Metadata = indexableMetadata("/shipping", {
  title: "Shipping",
  description: "Where France Mobilier ships in the United States, cost, tracking, and timeframes.",
});

export default function ShippingPage() {
  const shipping = getShippingPolicy();
  const delivery = getDefaultDeliveryProfile();

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Shipping</h1>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-xl font-semibold text-navy">Where we ship</h2>
          <p className="mt-3">
            {SHIPPING_OFFERED_SENTENCE} We do not ship to Alaska, Hawaii, U.S. territories, or
            military APO/FPO addresses, or outside the United States.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">Cost</h2>
          <p className="mt-3">
            Standard shipping is free (${shipping.shippingCostUsd.toFixed(2)}) to addresses in the
            contiguous United States. Prices on the site are in U.S. dollars. Applicable sales tax
            may be added at checkout where we are required to collect it. If the goods are shipped
            internationally to you, any import duties or fees charged by the carrier or customs are
            not included in the price unless they appear in the checkout total.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">Preparation and transit</h2>
          <p className="mt-3">
            Preparation: 1 week ({delivery.handlingMinBusinessDays} business days) after payment.
            Transit: {delivery.transitMinBusinessDays} business days after the package ships. When
            an item is made to order, these timeframes start after the order is placed. We do not
            display a guaranteed delivery date.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">Tracking</h2>
          <p className="mt-3">
            We email you when preparation is complete (based on the stated handling time), then when
            the package ships. A tracking number is sent only when the carrier provides one.
          </p>
        </section>
      </div>
      <Link href="/collections/meubles" className="btn btn-secondary mt-8 inline-flex">
        Browse the collection
      </Link>
    </div>
  );
}
