import Image from "next/image";
import Link from "next/link";
import { store } from "@/config/store";
import { CookieManageButton } from "@/components/cookie-manage-button";
import { getBusinessIdentity } from "@/lib/business/identity";

const groups = [
  {
    title: "Nos meubles",
    links: [
      { href: "/collections/salon", label: "Salon" },
      { href: "/collections/chambre", label: "Chambre" },
      { href: "/collections/entree-rangement", label: "Entrée & rangement" },
      { href: "/collections/bureau", label: "Bureau" },
      { href: "/collections/petits-espaces", label: "Petits espaces" },
      { href: "/collections/meubles", label: "Tous les meubles" },
    ],
  },
  {
    title: "Aide",
    links: [
      { href: "/livraison", label: "Livraison" },
      { href: "/retours", label: "Retours et remboursements" },
      { href: "/contact", label: "Contact" },
      { href: "/questions-frequentes", label: "FAQ" },
      { href: "/guides", label: "Conseils" },
    ],
  },
  {
    title: "Professionnels",
    links: [
      { href: "/professionnels", label: "France Mobilier Pro" },
      { href: "/compte/devis", label: "Demande de devis" },
    ],
  },
  {
    title: "Informations",
    links: [
      { href: "/a-propos", label: "Notre histoire" },
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/cgv", label: "CGV" },
      { href: "/confidentialite", label: "Confidentialité" },
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
            {identity.relationship} Une sélection pensée pour les logements d’aujourd’hui.
          </p>
          <p className="mt-4 text-sm text-white/75">{identity.email}</p>
          {identity.phone ? <p className="mt-1 text-sm text-white/75">{identity.phone}</p> : null}
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold">{group.title}</p>
            <ul className="mt-3 text-sm text-white/75">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.href}-${link.label}`}>
                  <Link href={link.href} className="inline-flex min-h-11 items-center hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
              {group.title === "Informations" ? (
                <li>
                  <CookieManageButton className="inline-flex min-h-11 items-center bg-transparent p-0 text-inherit hover:text-white" />
                </li>
              ) : null}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-white/55 md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} {store.storeName}. Tous droits réservés.
          </p>
          <p>
            {store.companyName} — {store.companyCity}
          </p>
        </div>
      </div>
    </footer>
  );
}
