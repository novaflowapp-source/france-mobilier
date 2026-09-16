import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/config/store";

export const metadata: Metadata = {
  title: "Quel meuble à chaussures pour une entrée étroite ?",
  description:
    "Comment choisir un meuble à chaussures quand le couloir est étroit : profondeur, assise, portes coulissantes.",
  alternates: { canonical: `${store.domain}/guides/meuble-chaussures-entree-etroite` },
};

export default function GuideEntryPage() {
  return (
    <article className="container-page max-w-3xl py-10 md:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/">Accueil</Link> / <Link href="/guides">Conseils</Link> /{" "}
        <span className="text-foreground">Entrée étroite</span>
      </nav>
      <h1 className="display text-3xl text-navy md:text-4xl">
        Quel meuble à chaussures pour une entrée étroite ?
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">
        Dans un couloir, la profondeur compte plus que la largeur. Un meuble trop avancé bloque la
        porte, le passage, parfois le radiateur.
      </p>
      <div className="mt-8 space-y-4 leading-relaxed text-muted">
        <p>
          Si la profondeur est connue, visez un meuble qui reste le long du mur. Notre{" "}
          <Link href="/produits/meuble-casiers" className="text-navy underline-offset-4 hover:underline">
            meuble à casiers
          </Link>{" "}
          fait 20 cm de profondeur : il range et laisse le passage libre.
        </p>
        <p>
          Le{" "}
          <Link href="/produits/meuble-entree" className="text-navy underline-offset-4 hover:underline">
            meuble d’entrée / meuble à chaussures
          </Link>{" "}
          sert aussi d’assise. Sa profondeur sera publiée dès qu’elle est connue. On le choisit
          surtout pour l’usage — s’asseoir, ranger les paires derrière les portes coulissantes.
        </p>
        <p>
          Un meuble à chaussures étroit, à ouverture verticale, peut aussi convenir quand on veut
          fermer le rangement. Il est pour l’instant indiqué comme bientôt disponible.
        </p>
      </div>
      <Link href="/collections/meubles-chaussures" className="btn btn-primary mt-10 inline-flex">
        Voir les meubles à chaussures
      </Link>
    </article>
  );
}
