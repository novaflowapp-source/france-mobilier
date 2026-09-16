import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

export const metadata: Metadata = {
  title: "Commande",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Commande</h1>
      <p className="mt-2 text-muted">
        {SHIPPING_OFFERED_SENTENCE} Paiement par carte, Apple Pay, Google Pay et autres moyens selon
        l’appareil.
      </p>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
