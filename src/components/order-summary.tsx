import Link from "next/link";
import type { PublicOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/products/repository";
import { shippingCountryName } from "@/lib/shipping-zone";

function formatDate(value: Date | string | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export function OrderSummary({
  order,
  href,
}: {
  order: PublicOrder;
  href?: string;
}) {
  const heading = (
    <h3 className="font-medium text-navy">
      Commande {order.reference}
      {order.paidAt ? <span className="ml-2 text-sm font-normal text-muted">{formatDate(order.paidAt)}</span> : null}
    </h3>
  );

  return (
    <article className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      {href ? (
        <Link href={href} className="hover:underline">
          {heading}
        </Link>
      ) : (
        heading
      )}
      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((item) => (
          <li key={`${item.name}-${item.quantity}`} className="flex justify-between gap-3">
            <span className="min-w-0 break-words">
              {item.name} × {item.quantity}
            </span>
            <span>{formatPrice((item.unitPriceCents * item.quantity) / 100)}</span>
          </li>
        ))}
      </ul>
      {order.promoDiscountCents > 0 ? (
        <p className="mt-3 flex justify-between text-sm text-muted">
          <span>{order.promoCode ? `Code ${order.promoCode}` : "Remise"}</span>
          <span>−{formatPrice(order.promoDiscountCents / 100)}</span>
        </p>
      ) : null}
      <p className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-medium">
        <span>Total TTC</span>
        <span>{formatPrice(order.amountCents / 100)}</span>
      </p>
      {order.fulfillmentLabel ? (
        <p className="mt-3 text-sm leading-relaxed text-navy">{order.fulfillmentLabel}.</p>
      ) : null}
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {order.companyName && order.siren ? (
          <>
            {order.companyName} — SIREN {order.siren}
            <br />
          </>
        ) : null}
        {order.name}
        <br />
        {order.line1}
        <br />
        {order.postalCode} {order.city}
        <br />
        {shippingCountryName(order.country)}
        {order.phone ? (
          <>
            <br />
            {order.phone}
          </>
        ) : null}
      </p>
    </article>
  );
}
