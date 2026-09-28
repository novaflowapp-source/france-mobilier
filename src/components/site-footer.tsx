import Image from "next/image";
import Link from "next/link";
import { store } from "@/config/store";
import { CookieManageButton } from "@/components/cookie-manage-button";
import { IconLock, IconReturn, IconTruck } from "@/components/icons";
import { PaymentMarks } from "@/components/payment-marks";
import { formatPublicAddress, getBusinessIdentity } from "@/lib/business/identity";

const groups = [
  {
    title: "Shop",
    links: [
      { href: "/collections/living-room", label: "Living room" },
      { href: "/collections/bedroom", label: "Bedroom" },
      { href: "/collections/entry-storage", label: "Entry & storage" },
      { href: "/collections/office", label: "Office" },
      { href: "/collections/small-spaces", label: "Small spaces" },
      { href: "/collections/furniture", label: "All furniture" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns & refunds" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
      { href: "/guides", label: "Guides" },
    ],
  },
  {
    title: "Professionals",
    links: [
      { href: "/trade", label: "France Mobilier Pro" },
      { href: "/account/quotes", label: "Request a quote" },
    ],
  },
  {
    title: "Information",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/legal", label: "Legal notice" },
      { href: "/terms", label: "Terms" },
      { href: "/terms/payment-methods", label: "Payment methods" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  const identity = getBusinessIdentity();
  return (
    <footer className="mt-10 bg-navy text-white pb-[env(safe-area-inset-bottom)]">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-10 lg:py-14">
        <div>
          <Link href="/" className="inline-flex rounded-md bg-white px-2 py-1.5">
            <Image
              src={store.logoPath}
              alt={store.storeName}
              width={160}
              height={118}
              className="h-12 w-auto object-contain"
            />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/75">
            Curated furniture for modern living.
          </p>
          <p className="mt-4 text-sm text-white/70">
            <a href={`mailto:${identity.email}`}>{identity.email}</a>
          </p>
          {identity.phone ? (
            <p className="mt-1 text-sm text-white/70">
              <a href={`tel:${identity.phone.replace(/\s+/g, "")}`}>{identity.phone}</a>
            </p>
          ) : null}
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold">{group.title}</p>
            <ul className="mt-3 text-sm text-white/70">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.href}-${link.label}`}>
                  <Link href={link.href} className="inline-flex min-h-11 items-center">
                    {link.label}
                  </Link>
                </li>
              ))}
              {group.title === "Information" ? (
                <li>
                  <CookieManageButton className="inline-flex min-h-11 items-center bg-transparent p-0 text-inherit" />
                </li>
              ) : null}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between md:gap-8">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/75">
            <li>
              <Link href="/shipping" className="inline-flex min-h-11 items-center gap-2">
                <IconTruck className="h-4 w-4" />
                Free shipping
              </Link>
            </li>
            <li>
              <Link href="/returns" className="inline-flex min-h-11 items-center gap-2">
                <IconReturn className="h-4 w-4" />
                14-day returns
              </Link>
            </li>
            <li className="inline-flex min-h-11 items-center gap-2">
              <IconLock className="h-4 w-4" />
              Secure payment
            </li>
          </ul>
          <PaymentMarks />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-white/55 md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} {store.storeName}. All rights reserved.
          </p>
          <p>
            {identity.legalName} — {formatPublicAddress(identity)}
            <br />
            {identity.registration}
          </p>
        </div>
      </div>
    </footer>
  );
}
