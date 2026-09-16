import type { Metadata } from "next";
import Link from "next/link";
import { ProAccessForm } from "@/components/pro-access-form";
import { store } from "@/config/store";
import { b2bConfig } from "@/lib/b2b";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/professionnels", {
  title: "France Mobilier Pro | Mobilier pour professionnels",
  description:
    "Compte professionnel France Mobilier : informations d’entreprise, devis et commandes de mobilier pour l’aménagement, l’hôtellerie, la restauration et l’entreprise.",
});

const benefits = [
  {
    title: "Facturation professionnelle",
    text: "Commandez directement au nom de votre entreprise.",
  },
  {
    title: "Demande de devis",
    text: "Recevez une proposition personnalisée pour vos projets et commandes en volume.",
  },
  {
    title: "Accompagnement",
    text: "Contactez France Mobilier pour vos besoins spécifiques.",
  },
  {
    title: "Conditions professionnelles",
    text: "Des conditions adaptées peuvent être proposées selon les produits et volumes commandés.",
  },
];

export default function ProfessionnelsPage() {
  const sales = b2bConfig().salesEmail;
  return (
    <div className="container-page py-10 md:py-16">
      <p className="eyebrow">France Mobilier Pro</p>
      <h1 className="display mt-3 max-w-3xl text-3xl text-navy md:text-4xl">France Mobilier Pro</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-navy">
        Des solutions dédiées aux professionnels de l’aménagement, de l’hôtellerie, de la restauration
        et de l’entreprise.
      </p>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">
        Créez votre compte professionnel pour centraliser vos informations d’entreprise, demander des
        devis et simplifier vos commandes de mobilier.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {benefits.map((item) => (
          <div key={item.title} className="rounded-2xl border border-border bg-white p-5">
            <p className="font-medium text-navy">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <ProAccessForm />
        <div className="space-y-6">
          <div className="rounded-[var(--radius)] bg-cream p-6 text-sm leading-relaxed text-muted">
            <p className="font-medium text-navy">Des projets de toute taille</p>
            <p className="mt-2">
              Que vous équipiez un appartement, des bureaux ou plusieurs chambres, notre service
              professionnel peut étudier votre demande.
            </p>
            <p className="mt-4 font-medium text-navy">Un espace unique</p>
            <p className="mt-2">
              Centralisez vos demandes de devis et commandes professionnelles depuis votre compte.
            </p>
            <p className="mt-4">
              Service Professionnels :{" "}
              <a href={`mailto:${sales}`} className="text-navy underline-offset-4 hover:underline">
                {sales}
              </a>
            </p>
            <p className="mt-4">
              Les prix du catalogue restent TTC. Vous pouvez aussi le faire depuis{" "}
              <Link href="/compte/entreprise" className="text-navy underline-offset-4 hover:underline">
                Mon espace
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
