import Link from "next/link";
import { deliveryLabel } from "@/lib/products/presentation";
import { SHIPPING_OFFERED_SENTENCE, SHIPPING_ZONE_LABEL } from "@/lib/shipping-zone";
import type { Product } from "@/lib/types/commerce";

export function ProductShippingReturns({ product }: { product: Product }) {
  const delivery = deliveryLabel(product);

  return (
    <section className="section">
      <div className="container-page">
        <h2 className="display text-3xl text-navy">Shipping & returns</h2>
        <div className="prose-narrow mt-8 grid gap-8 md:grid-cols-2">
          <div className="space-y-3 text-[0.95rem] leading-relaxed text-muted">
            <p>
              <span className="font-medium text-navy">Where we ship. </span>
              {SHIPPING_OFFERED_SENTENCE} We do not ship outside {SHIPPING_ZONE_LABEL}.
            </p>
            <p>
              <span className="font-medium text-navy">Cost. </span>
              Shipping is free at checkout for eligible addresses.
            </p>
            {delivery ? (
              <p>
                <span className="font-medium text-navy">Delivery. </span>
                {product.madeToOrder
                  ? `Made to order after you buy. ${delivery.charAt(0).toUpperCase()}${delivery.slice(1)}. Exact arrival date is not known in advance.`
                  : `${delivery.charAt(0).toUpperCase()}${delivery.slice(1)}.`}
              </p>
            ) : (
              <p>
                <span className="font-medium text-navy">Timing. </span>
                Estimated timelines appear at checkout when we have them. We do not show a delivery
                date unless it is confirmed.
              </p>
            )}
          </div>
          <div className="space-y-3 text-[0.95rem] leading-relaxed text-muted">
            <p>
              <span className="font-medium text-navy">Tracking. </span>
              A tracking number is emailed after your order ships.
            </p>
            <p>
              <span className="font-medium text-navy">Returns. </span>
              14 days from delivery to request a return when applicable. Items must be sent back in
              resalable condition.
            </p>
            <p>
              <Link href="/shipping" className="text-navy underline-offset-4 hover:underline">
                Shipping
              </Link>
              {" · "}
              <Link href="/returns" className="text-navy underline-offset-4 hover:underline">
                Returns & refunds
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
