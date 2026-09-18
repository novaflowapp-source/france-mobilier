import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusinessIdentity } from "@/lib/business/identity";
import { getReturnPolicy } from "@/lib/business/policies";
import {
  PAYMENT_METHODS_PATH,
  getPaymentMethod,
  paymentMethodHref,
  paymentMethods,
} from "@/lib/payment-methods";
import { indexableMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return paymentMethods.map((method) => ({ slug: method.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const method = getPaymentMethod(slug);
  if (!method) return {};
  return indexableMetadata(paymentMethodHref(method.slug), {
    title: `${method.title} — CGV`,
    description: method.description,
  });
}

export default async function PaymentMethodPage({ params }: Props) {
  const { slug } = await params;
  const method = getPaymentMethod(slug);
  if (!method) notFound();

  const identity = getBusinessIdentity();
  const returns = getReturnPolicy();

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="text-navy underline-offset-4 hover:underline">
          Accueil
        </Link>
        {" / "}
        <Link href="/cgv" className="text-navy underline-offset-4 hover:underline">
          CGV
        </Link>
        {" / "}
        <Link href={PAYMENT_METHODS_PATH} className="text-navy underline-offset-4 hover:underline">
          Moyens de paiement
        </Link>
        {" / "}
        <span className="text-foreground">{method.name}</span>
      </nav>
      <h1 className="text-3xl font-semibold tracking-tight">{method.title}</h1>
      <div className="mt-6 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-xl font-semibold text-navy">Principe</h2>
          <p className="mt-3">{method.summary}</p>
          <p className="mt-3">
            Le paiement d’une commande {identity.storeName} est traité par Stripe, prestataire de
            services de paiement. La commande n’est ferme qu’après confirmation du paiement. Le
            montant débité est celui affiché en euros TTC au moment du paiement.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">Fonctionnement</h2>
          <p className="mt-3">{method.how}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">Disponibilité</h2>
          <p className="mt-3">{method.availability}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">Sécurité et données</h2>
          <p className="mt-3">
            {identity.legalName} ne stocke pas le numéro complet de votre carte ni les données de
            portefeuille. Ces informations sont collectées et traitées par Stripe, selon sa{" "}
            <a
              href="https://stripe.com/fr/privacy"
              className="text-navy underline-offset-4 hover:underline"
              rel="noreferrer"
              target="_blank"
            >
              politique de confidentialité
            </a>
            . Le traitement des données de commande est décrit dans notre{" "}
            <Link href="/confidentialite" className="text-navy underline-offset-4 hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
          {method.extraTerms ? <p className="mt-3">{method.extraTerms}</p> : null}
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">Remboursements</h2>
          <p className="mt-3">
            Un remboursement est effectué sur le même moyen de paiement, dans les conditions de la
            page{" "}
            <Link href="/retours" className="text-navy underline-offset-4 hover:underline">
              Retours et remboursements
            </Link>
            , sous {returns.refundProcessingMaxDays} jours après réception du retour ou de la
            preuve requise. Ces règles s’inscrivent dans les{" "}
            <Link href="/cgv" className="text-navy underline-offset-4 hover:underline">
              conditions générales de vente
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
