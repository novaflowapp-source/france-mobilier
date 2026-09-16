import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/config/store";

export const metadata: Metadata = {
  title: "Conseils & inspiration",
  description:
    "Guides courts pour choisir un meuble selon la pièce, la profondeur et les petits espaces.",
  alternates: { canonical: `${store.domain}/guides` },
};

const guides = [
  {
    href: "/guides/meuble-chaussures-entree-etroite",
    title: "Quel meuble à chaussures pour une entrée étroite ?",
    text: "Comment lire la profondeur et libérer le passage.",
  },
  {
    href: "/guides/profondeur-table-de-chevet",
    title: "Quelle profondeur pour une table de chevet ?",
    text: "Les mesures à vérifier avant d’acheter, surtout dans une petite chambre.",
  },
  {
    href: "/guides/amenager-un-studio",
    title: "Comment aménager un studio avec aisance ?",
    text: "Extensible, peu profond, multifonction : le meuble qui rend la pièce plus belle.",
  },
  {
    href: "/guides/quelle-table-petit-salon",
    title: "Quelle table pour un petit salon ?",
    text: "Table basse ou extensible : pour un salon plus fluide.",
  },
];

export default function GuidesPage() {
  return (
    <div className="container-page py-10 md:py-16">
      <p className="eyebrow">Conseils</p>
      <h1 className="display mt-3 text-3xl text-navy md:text-4xl">Conseils & inspiration</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Des articles utiles, liés aux meubles de la boutique.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="rounded-[var(--radius)] border border-border bg-white p-5 hover:bg-cream"
          >
            <h2 className="font-medium text-navy">{guide.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{guide.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
