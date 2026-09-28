import type { Metadata } from "next";
import Link from "next/link";
import { AdminReviews } from "@/components/admin-reviews";
import { collections, store } from "@/config/store";
import { getActivityAdminSession, getAdminSession, listAdminEmails } from "@/lib/admin";
import { countContactMessages } from "@/lib/contact";
import { listProducts } from "@/lib/products/repository";
import { getIntegrationStatuses } from "@/lib/providers/manual/provider";
import { countProAccessRequests } from "@/lib/pro-access";
import { listRecentPaidOrders } from "@/lib/orders";
import { countPendingReviews, listModerationReviews } from "@/lib/reviews";
import { countStockAlerts, countStockAlertsByProduct } from "@/lib/stock-alerts";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const products = listProducts();
  const statuses = getIntegrationStatuses();
  const admin = await getAdminSession();
  const activityAdmin = await getActivityAdminSession();
  const [alertCount, contactCount, proCount, pendingReviews, alertsByProduct, reviews, recentOrders] =
    await Promise.all([
      countStockAlerts(),
      countContactMessages(),
      countProAccessRequests(),
      countPendingReviews(),
      countStockAlertsByProduct(),
      admin ? listModerationReviews() : Promise.resolve([]),
      admin ? listRecentPaidOrders(30) : Promise.resolve([]),
    ]);
  const sellable = products.filter((p) => p.availabilityStatus === "available").length;
  const adminEmail = listAdminEmails()[0];

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-2 text-sm text-muted">Internal view — not indexed. No emails or secrets shown.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Products</p>
          <p className="mt-1 text-3xl font-semibold">{products.length}</p>
          <p className="mt-1 text-xs text-muted">{sellable} sellable</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Collections</p>
          <p className="mt-1 text-3xl font-semibold">{collections.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Stock alerts</p>
          <p className="mt-1 text-3xl font-semibold">{alertCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Contact messages</p>
          <p className="mt-1 text-3xl font-semibold">{contactCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Pro access requests</p>
          <p className="mt-1 text-3xl font-semibold">{proCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Reviews to moderate</p>
          <p className="mt-1 text-3xl font-semibold">{pendingReviews}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Recent orders</p>
          <p className="mt-1 text-3xl font-semibold">{recentOrders.length}</p>
        </div>
        {activityAdmin ? (
          <Link
            href="/admin/activity"
            className="rounded-2xl border border-border bg-card p-5 transition hover:border-navy"
          >
            <p className="text-sm text-muted">All time</p>
            <p className="mt-1 text-lg font-semibold text-navy">Store activity</p>
            <p className="mt-1 text-xs text-muted">Views, carts, Stripe opens, purchases</p>
          </Link>
        ) : null}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background/60">
            <tr>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Checkout", statuses.checkout],
              ["Stripe", statuses.stripe],
              ["BuckyDrop API", statuses.buckydrop],
              ["Merchant Center", statuses.merchantCenter],
              ["Keyword Planner", statuses.keywordPlanner],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-border last:border-0">
                <td className="px-5 py-3">{label}</td>
                <td className="px-5 py-3 font-medium">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {alertsByProduct.length > 0 ? (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background/60">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {alertsByProduct.map((row) => (
                <tr key={row.productSlug} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">{row.productSlug}</td>
                  <td className="px-5 py-3 font-medium">{Number(row.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {admin && recentOrders.length > 0 ? (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background/60">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Fulfillment</th>
                <th className="px-5 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <Link href={`/order/${order.id}`} className="font-medium hover:underline">
                      {order.reference}
                    </Link>
                    <p className="text-xs text-muted">
                      {order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    {order.name}
                    <p className="text-xs text-muted">{order.email}</p>
                    {order.companyName && order.siren ? (
                      <p className="text-xs text-muted">
                        {order.companyName} · SIREN {order.siren}
                      </p>
                    ) : null}
                    {order.phone ? <p className="text-xs text-muted">{order.phone}</p> : null}
                  </td>
                  <td className="px-5 py-3 text-xs leading-relaxed text-muted">
                    {order.fulfillmentLabel}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    {(order.amountCents / 100).toLocaleString(store.locale, {
                      style: "currency",
                      currency: store.currency,
                    })}
                    {order.promoCode ? (
                      <p className="text-xs font-normal text-muted">Code {order.promoCode}</p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <p className="mt-6 text-sm">
        {activityAdmin ? (
          <>
            <Link href="/admin/activity" className="text-navy underline-offset-2 hover:underline">
              Store activity
            </Link>
            {" · "}
          </>
        ) : null}
        <Link href="/admin/professionals" className="text-navy underline-offset-2 hover:underline">
          Professionals
        </Link>
        {" · "}
        <Link href="/admin/quotes" className="text-navy underline-offset-2 hover:underline">
          Trade quotes
        </Link>
        {" · "}
        <Link href="/admin/keywords" className="text-navy underline-offset-2 hover:underline">
          Search volumes (Keyword Planner)
        </Link>
        {" · "}
        <Link href="/admin/merchant-readiness" className="text-navy underline-offset-2 hover:underline">
          Merchant readiness
        </Link>
      </p>

      {admin ? (
        <AdminReviews initialReviews={reviews} />
      ) : (
        <section className="mt-10 rounded-2xl border border-border bg-white p-5">
          <h2 className="text-xl font-semibold tracking-tight">Customer reviews</h2>
          <p className="mt-2 text-sm text-muted">
            Sign in with the admin account to publish or archive reviews.
            {adminEmail ? (
              <>
                {" "}
                <Link href="/login?next=/admin" className="text-navy underline-offset-2 hover:underline">
                  Sign in
                </Link>
              </>
            ) : null}
          </p>
        </section>
      )}

      <p className="mt-6 text-sm text-muted">
        Back to store: <Link href="/" className="underline">home</Link>
      </p>
    </div>
  );
}
