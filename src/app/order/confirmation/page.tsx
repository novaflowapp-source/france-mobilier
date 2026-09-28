import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/order-confirmation";

export const metadata: Metadata = {
  title: "Payment confirmed",
  robots: { index: false, follow: false },
};

export default function ConfirmationPage() {
  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Thank you for your order</h1>
      <div className="mt-6">
        <Suspense fallback={<p className="text-muted">Confirming payment…</p>}>
          <OrderConfirmation />
        </Suspense>
      </div>
    </div>
  );
}
