import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessIdentity } from "@/lib/business/identity";
import { getReturnPolicy } from "@/lib/business/policies";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/retours", {
  title: "Retours et remboursements",
  description:
    "Droit de rétractation, retours, produits défectueux et remboursements chez France Mobilier.",
});

export default function ReturnsPage() {
  const identity = getBusinessIdentity();
  const policy = getReturnPolicy();
  const returnCost =
    policy.returnShippingCostResponsibility === "seller"
      ? "Les frais de retour sont pris en charge par France Mobilier."
      : policy.returnShippingCostResponsibility === "customer"
        ? "Les frais de retour sont à votre charge, sauf si le produit est défectueux, endommagé à la livraison ou ne correspond pas à la commande."
        : null;

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Retours et remboursements</h1>
      <p className="mt-4 text-muted">{identity.relationship}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-xl font-semibold text-navy">Délai de rétractation</h2>
          <p className="mt-3">
            Vous disposez de {policy.returnWindowDays} jours à compter de la réception pour exercer
            votre droit de rétractation, lorsque le droit français de la consommation s’applique.
            Vous n’avez pas à justifier de motif. Le produit doit être renvoyé dans un état
            permettant sa revente, avec ses accessoires.
          </p>
          <p className="mt-3">
            Un meuble simplement fabriqué après commande, sans personnalisation, reste concerné par
            ce droit lorsqu’il s’applique. Un bien réellement fabriqué selon vos spécifications
            individuelles peut en être exclu, conformément à la loi.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">Comment demander un retour ?</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              Écrivez à{" "}
              <a href={`mailto:${policy.contactEmail}`} className="text-navy underline-offset-4 hover:underline">
                {policy.contactEmail}
              </a>{" "}
              en indiquant votre numéro de commande.
            </li>
            <li>Précisez s’il s’agit d’un changement d’avis ou d’un produit défectueux / endommagé.</li>
            <li>Attendez nos instructions de renvoi avant d’expédier le colis.</li>
            <li>Emballez le produit pour le protéger pendant le transport.</li>
            <li>Expédiez-le selon la méthode indiquée dans notre réponse.</li>
          </ol>
          <p className="mt-3">
            L’adresse de retour n’est pas laissée au hasard : elle vous est communiquée après
            contact, car elle peut dépendre du produit.
          </p>
          {policy.returnAddress ? (
            <p className="mt-3 font-medium text-navy">
              Adresse de référence : {policy.returnAddress}.
            </p>
          ) : null}
        </section>

        {returnCost ? (
          <section>
            <h2 className="text-xl font-semibold text-navy">Frais de retour</h2>
            <p className="mt-3">{returnCost}</p>
          </section>
        ) : null}

        <section>
          <h2 className="text-xl font-semibold text-navy">Remboursement</h2>
          <p className="mt-3">
            Le remboursement est effectué sur le même moyen de paiement, sous{" "}
            {policy.refundProcessingMinDays} à {policy.refundProcessingMaxDays} jours après réception
            du retour ou de la preuve d’expédition, conformément au code de la consommation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">Produit défectueux, endommagé ou erreur</h2>
          <p className="mt-3">
            Si le meuble arrive endommagé, est défectueux ou ne correspond pas à la commande,
            contactez-nous avec le numéro de commande et des photos. Ce cas n’est pas un simple
            changement d’avis : nous organisons l’échange, la réparation ou le remboursement selon
            la situation. La garantie légale de conformité ({policy.legalConformityYears} ans) et la
            garantie des vices cachés s’appliquent.
          </p>
        </section>

        <p>
          <Link href="/livraison" className="text-navy underline-offset-4 hover:underline">
            Livraison
          </Link>
          {" · "}
          <Link href="/cgv" className="text-navy underline-offset-4 hover:underline">
            CGV
          </Link>
          {" · "}
          <Link href="/contact" className="text-navy underline-offset-4 hover:underline">
            Contact
          </Link>
        </p>
      </div>
    </div>
  );
}
