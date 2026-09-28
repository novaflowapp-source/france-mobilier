import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-2 text-muted">
        {SHIPPING_OFFERED_SENTENCE} Enter your US address and phone, then pay on Stripe (card, Apple
        Pay, or Google Pay depending on your device).
      </p>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
