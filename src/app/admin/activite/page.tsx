import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminActivityLive } from "@/components/admin-activity-live";
import { getActivityAdminSession } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Activité boutique",
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
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Activité boutique</h1>
      <p className="mt-2 text-sm text-muted">
        Vues produit, ajouts au panier, ouvertures de la page Stripe et achats payés — totaux
        depuis le début du suivi, mis à jour en direct. « Ouverture Stripe » compte un clic sur
        Payer, pas seulement une visite de la page commande.
      </p>
      <div className="mt-8">
        <AdminActivityLive />
      </div>
    </div>
  );
}
