import type { Metadata } from "next";
import Link from "next/link";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/guides/amenager-un-studio", {
  title: "Comment aménager un studio avec aisance ?",
  description:
    "Meubles peu profonds, tables extensibles et rangements étroits pour un studio ou un petit appartement.",
});

export default function GuideStudioPage() {
  return (
    <article className="container-page max-w-3xl py-10 md:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/">Accueil</Link> / <Link href="/guides">Conseils</Link> /{" "}
        <span className="text-foreground">Studio</span>
      </nav>
      <h1 className="display text-3xl text-navy md:text-4xl">
        Comment aménager un studio avec aisance ?
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">
        Dans 20 à 35 m², chaque meuble gagne à rendre plusieurs services, et à s’aligner le long du
        mur.
      </p>
      <div className="mt-8 space-y-4 leading-relaxed text-muted">
        <p>
          Une{" "}
          <Link
            href="/produits/table-a-manger-extensible"
            className="text-navy underline-offset-4 hover:underline"
          >
            table à manger extensible
          </Link>{" "}
          reste ronde au quotidien, puis s’ouvre pour les repas. Elle évite une table fixe trop
          grande.
        </p>
        <p>
          Un{" "}
          <Link href="/produits/meuble-tv" className="text-navy underline-offset-4 hover:underline">
            meuble TV de 24 cm de profondeur
          </Link>{" "}
          et un{" "}
          <Link href="/produits/meuble-casiers" className="text-navy underline-offset-4 hover:underline">
            meuble à casiers de 20 cm
          </Link>{" "}
          se placent contre le mur sans avancer dans la pièce.
        </p>
        <p>
          On évite d’empiler les accessoires à bas prix au milieu du salon : ils remplissent la
          photo, rarement le quotidien.
        </p>
      </div>
      <Link href="/collections/petits-espaces" className="btn btn-primary mt-10 inline-flex">
        Voir les meubles pour petits espaces
      </Link>
    </article>
  );
}
