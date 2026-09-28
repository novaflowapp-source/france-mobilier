import type { Metadata } from "next";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { OrderSummary } from "@/components/order-summary";
import { store } from "@/config/store";
import { getAdminSession } from "@/lib/admin";
import { auth, prepareAuth } from "@/lib/auth";
import { getAuthorizedOrder, getPublicPaidOrder, ORDER_ACCESS_COOKIE } from "@/lib/orders";
import { formatParisYmd } from "@/lib/orders/business-days";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
};

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { t } = await searchParams;
  await prepareAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const admin = await getAdminSession();
  const cookie = (await cookies()).get(ORDER_ACCESS_COOKIE)?.value;
  const order = admin
    ? await getPublicPaidOrder(id)
    : await getAuthorizedOrder(id, {
        token: t,
        cookie,
        userId: session?.user?.id,
        email: session?.user?.email,
      });
  if (!order) notFound();

  const paidDate =
    order.paidAt &&
    new Intl.DateTimeFormat(store.locale, {
      dateStyle: "long",
      timeZone: "Europe/Paris",
    }).format(new Date(order.paidAt));

  return (
    <div className="container-page max-w-xl space-y-6 py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Your order</h1>
      <OrderSummary order={order} />
      <div className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-muted sm:p-5">
        <p className="font-medium text-navy">Tracking</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            Payment received
            {paidDate ? ` on ${paidDate}` : ""}.
          </li>
          <li>
            Preparation ({order.fulfillment.handlingBusinessDays} business days)
            {order.fulfillment.phase === "preparing"
              ? ` — in progress, expected done ${formatParisYmd(order.fulfillment.expectedPreparedOn)}`
              : " — complete"}
            .
          </li>
          <li>
            Shipment
            {order.fulfillment.phase === "shipped"
              ? " — handed to carrier"
              : order.fulfillment.phase === "prepared"
                ? " — in progress"
                : " — after preparation"}
            .
          </li>
          <li>
            Transit: {order.fulfillment.transitBusinessDays} business days after shipment. Tracking is
            sent only when the carrier provides a number.
          </li>
        </ol>
        <p className="mt-3">{SHIPPING_OFFERED_SENTENCE}</p>
      </div>
      <Link href="/account" className="btn btn-secondary inline-flex">
        All my orders
      </Link>
    </div>
  );
}
