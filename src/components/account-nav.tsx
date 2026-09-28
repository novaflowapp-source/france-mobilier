"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProApproved } from "@/lib/use-pro-approved";
import { authClient } from "@/lib/auth-client";

const allLinks = [
  { href: "/account", label: "Dashboard", key: "overview" },
  { href: "/account#orders", label: "Orders", key: "orders" },
  { href: "/account/quotes", label: "Quotes", key: "quotes" },
  { href: "/account/invoices", label: "Invoices", key: "invoices" },
  { href: "/account/company", label: "Company", key: "company" },
] as const;

function currentFromPath(pathname: string) {
  if (pathname.startsWith("/account/quotes")) return "quotes";
  if (pathname.startsWith("/account/invoices")) return "invoices";
  if (pathname.startsWith("/account/company")) return "company";
  return "overview";
}

export function AccountNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname() || "/account";
  const current = currentFromPath(pathname);
  const { data: session, isPending } = authClient.useSession();
  const proApproved = useProApproved();

  if (!session?.user && !isPending) return null;

  const links = [
    ...(proApproved
      ? allLinks
      : allLinks.filter((link) => link.key === "overview" || link.key === "company")),
    ...(isAdmin ? [{ href: "/admin/activity", label: "Store activity", key: "admin" as const }] : []),
  ];

  return (
    <nav className="flex flex-nowrap gap-2 overflow-x-auto pb-0.5" aria-label="Account">
      {links.map((link) => {
        const isCurrent = current === link.key;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isCurrent ? "page" : undefined}
            className={`account-nav-link shrink-0 rounded-full px-3.5 py-1.5 text-sm ${
              isCurrent ? "" : "bg-cream"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
