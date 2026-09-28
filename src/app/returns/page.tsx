import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessIdentity } from "@/lib/business/identity";
import { getReturnPolicy } from "@/lib/business/policies";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/returns", {
  title: "Returns and refunds",
  description: "How to return an item to France Mobilier, damaged goods, and refunds.",
});

export default function ReturnsPage() {
  const identity = getBusinessIdentity();
  const policy = getReturnPolicy();
  const returnCost =
    policy.returnShippingCostResponsibility === "seller"
      ? "France Mobilier pays return shipping."
      : policy.returnShippingCostResponsibility === "customer"
        ? "You pay return shipping, unless the item is defective, damaged on arrival, or not what you ordered."
        : "Contact us before you ship a return. We will tell you who pays return shipping for your order.";

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Returns and refunds</h1>
      <p className="mt-4 text-muted">{identity.relationship}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-xl font-semibold text-navy">Store return window</h2>
          <p className="mt-3">
            You may return an unused item within {policy.returnWindowDays} days of delivery, for any
            reason. The item must be in resalable condition, with its accessories. This is a store
            policy for U.S. customers. It is not the European Union cooling-off right.
          </p>
          <p className="mt-3">
            Made-to-order items that are not customized to your specifications can still be returned
            under this policy. Items made to your individual specifications may not be returnable
            except if they arrive damaged, defective, or not as described.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">How to start a return</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              Email{" "}
              <a href={`mailto:${policy.contactEmail}`} className="text-navy underline-offset-4 hover:underline">
                {policy.contactEmail}
              </a>{" "}
              with your order number.
            </li>
            <li>Tell us whether it is a change of mind or a damaged / defective / wrong item.</li>
            <li>Wait for our return instructions before you ship anything.</li>
            <li>Pack the item so it is protected in transit.</li>
            <li>Ship it using the method we confirm in our reply.</li>
          </ol>
          <p className="mt-3">
            The return address is provided after you contact us, because it can depend on the
            product.
          </p>
          {policy.returnAddress ? (
            <p className="mt-3 font-medium text-navy">Reference address: {policy.returnAddress}.</p>
          ) : null}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">Return shipping</h2>
          <p className="mt-3">{returnCost}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">Refunds</h2>
          <p className="mt-3">
            Refunds are issued to the original payment method within {policy.refundProcessingMinDays}{" "}
            to {policy.refundProcessingMaxDays} days after we receive the return or proof of
            shipment, as applicable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">Damaged, defective, or wrong item</h2>
          <p className="mt-3">
            If the furniture arrives damaged, is defective, or does not match the order, email us
            with the order number and photos. This is not treated as a change of mind: we will
            arrange a replacement, repair, or refund as appropriate. Nothing in these pages limits
            rights that cannot be waived under the consumer-protection laws of your state.
          </p>
        </section>

        <p>
          <Link href="/shipping" className="text-navy underline-offset-4 hover:underline">
            Shipping
          </Link>
          {" · "}
          <Link href="/terms" className="text-navy underline-offset-4 hover:underline">
            Terms of sale
          </Link>
          {" · "}
          <Link href="/contact" className="text-navy underline-offset-4 hover:underline">
            Contact
          </Link>
        </p>
      </div>
    </div>
  );
}
