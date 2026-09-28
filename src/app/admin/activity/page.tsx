import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminActivityLive } from "@/components/admin-activity-live";
import { getActivityAdminSession } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Store activity",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const admin = await getActivityAdminSession();
  if (!admin) notFound();

  return (
    <div className="container-page py-10 md:py-14">
      <p className="text-sm">
        <Link href="/admin" className="text-navy underline-offset-2 hover:underline">
          ← Admin
        </Link>
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Store activity</h1>
      <p className="mt-2 text-sm text-muted">
        Product views, add-to-cart events, Stripe checkout opens, and paid purchases — totals since
        tracking started, updated live. “Stripe open” counts a click on Pay, not just a visit to the
        checkout page.
      </p>
      <div className="mt-8">
        <AdminActivityLive />
      </div>
    </div>
  );
}
