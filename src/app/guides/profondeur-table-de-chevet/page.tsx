import type { Metadata } from "next";
import Link from "next/link";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/guides/profondeur-table-de-chevet", {
  title: "Quelle profondeur pour une table de chevet ?",
  description:
    "Les mesures à vérifier pour une table de chevet dans une petite chambre : largeur, hauteur, dégagement.",
});

export default function GuideNightstandPage() {
  return (
    <article className="container-page max-w-3xl py-10 md:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/">Accueil</Link> / <Link href="/guides">Conseils</Link> /{" "}
        <span className="text-foreground">Table de chevet</span>
      </nav>
      <h1 className="display text-3xl text-navy md:text-4xl">
        Quelle profondeur pour une table de chevet ?
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">
        Une table de chevet trop profonde gêne l’ouverture du lit, surtout dans une chambre
        d’appartement.
      </p>
      <div className="mt-8 space-y-4 leading-relaxed text-muted">
        <p>
          La{" "}
          <Link href="/produits/table-de-chevet" className="text-navy underline-offset-4 hover:underline">
            table de chevet en rotin
          </Link>{" "}
          mesure 50 cm de large et 45 cm de haut. La profondeur n’est pas encore publiée : mieux
          vaut un trou dans la fiche qu’une mesure inventée.
        </p>
        <p>
          Ce que l’on peut déjà vérifier : la hauteur du caisson (20 cm), celle des pieds (25 cm),
          et la traverse à 13 cm du sol — utile si l’on veut passer le pied du lit ou un robot.
        </p>
        <p>
          En chambre compacte, on regarde aussi la largeur : 50 cm restent raisonnables de chaque
          côté d’un lit 140 ou 160.
        </p>
      </div>
      <Link href="/collections/tables-de-chevet" className="btn btn-primary mt-10 inline-flex">
        Voir les tables de chevet
      </Link>
    </article>
  );
}
