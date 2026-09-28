"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountNav } from "@/components/account-nav";

export function AccountChrome({ children, isAdmin = false }: { children: ReactNode; isAdmin?: boolean }) {
  const pathname = usePathname() || "/account";
  const onDashboard = pathname === "/account";

  return (
    <div className="container-page space-y-8 py-14">
      <AccountNav isAdmin={isAdmin} />
      {isAdmin && onDashboard ? (
        <Link href="/admin/activity" className="block rounded-2xl border border-navy/20 bg-white p-5 transition hover:border-navy">
          <p className="text-sm font-medium text-navy">Store activity</p>
          <p className="mt-1 text-sm text-muted">
            Product views, add-to-cart, Stripe checkouts, and purchases since tracking began.
          </p>
        </Link>
      ) : null}
      {children}
    </div>
  );
}
