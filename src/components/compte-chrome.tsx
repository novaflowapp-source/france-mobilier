"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountNav } from "@/components/account-nav";

export function CompteChrome({ children, isAdmin = false }: { children: ReactNode; isAdmin?: boolean }) {
  const pathname = usePathname() || "/compte";
  const onDashboard = pathname === "/compte";

  return (
    <div className="container-page space-y-8 py-14">
      <AccountNav isAdmin={isAdmin} />
      {isAdmin && onDashboard ? (
        <Link href="/admin/activite" className="block rounded-2xl border border-navy/20 bg-white p-5 transition hover:border-navy">
          <p className="text-sm font-medium text-navy">Activité boutique</p>
          <p className="mt-1 text-sm text-muted">
            Vues produit, ajouts au panier, ouvertures Stripe et achats, depuis le début.
          </p>
        </Link>
      ) : null}
      {children}
    </div>
  );
}
