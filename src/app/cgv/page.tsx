import type { Metadata } from "next";
import Link from "next/link";
import { formatPublicAddress, getBusinessIdentity } from "@/lib/business/identity";
import { getReturnPolicy, getShippingPolicy } from "@/lib/business/policies";
import { getDefaultDeliveryProfile } from "@/lib/merchant/delivery";
import { PAYMENT_METHODS_PATH, paymentMethodHref, paymentMethods } from "@/lib/payment-methods";
import { indexableMetadata } from "@/lib/seo";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

export const metadata: Metadata = indexableMetadata("/cgv", {
  title: "Conditions générales de vente",
});

export default function TermsPage() {
  const identity = getBusinessIdentity();
  const returns = getReturnPolicy();
  const shipping = getShippingPolicy();
  const delivery = getDefaultDeliveryProfile();
  const address = formatPublicAddress(identity);

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Conditions générales de vente</h1>
      <div className="mt-6 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-xl font-semibold text-navy">1. Identité du vendeur</h2>
          <p className="mt-3">{identity.relationship}</p>
          <p className="mt-2">
            {identity.legalName}, {identity.legalForm}. {identity.registration}.
            {address ? ` Siège : ${address}.` : ""} Contact : {identity.email}
            {identity.phone ? ` — ${identity.phone}` : ""}.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">2. Objet</h2>
          <p className="mt-3">
            Les présentes conditions s’appliquent aux ventes de meubles et accessoires conclues sur{" "}
            {identity.storeName} ({identity.domain}) auprès des consommateurs.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">3. Produits</h2>
          <p className="mt-3">
            Les caractéristiques essentielles figurent sur la fiche produit. Un meuble « fabriqué à
            la commande » est un modèle standard dont la fabrication est lancée après paiement, sauf
            mention contraire de personnalisation.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">4. Prix</h2>
          <p className="mt-3">
            Les prix sont indiqués en euros TTC. Le montant dû est celui affiché au moment du
            paiement. Les éventuelles conditions professionnelles ne remplacent pas le prix public.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">5. Commande et paiement</h2>
          <p className="mt-3">
            La commande est ferme après confirmation du paiement. Le paiement est traité par Stripe.
            Les moyens proposés (carte bancaire, Apple Pay, Google Pay, selon l’appareil) sont
            décrits dans la catégorie{" "}
            <Link href={PAYMENT_METHODS_PATH} className="text-navy underline-offset-4 hover:underline">
              Moyens de paiement
            </Link>
            . Aucun compte n’est exigé avant l’achat ; un accès client peut être ouvert après
            paiement.
          </p>
        </section>
        <section id="moyens-de-paiement" className="scroll-mt-28">
          <h2 className="text-xl font-semibold text-navy">6. Moyens de paiement</h2>
          <p className="mt-3">
            Les pages suivantes font partie des présentes conditions générales de vente. Elles
            expliquent chaque moyen de paiement accepté sur {identity.storeName} :
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {paymentMethods.map((method) => (
              <li key={method.slug}>
                <Link
                  href={paymentMethodHref(method.slug)}
                  className="text-navy underline-offset-4 hover:underline"
                >
                  {method.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Vue d’ensemble :{" "}
            <Link href={PAYMENT_METHODS_PATH} className="text-navy underline-offset-4 hover:underline">
              catégorie Moyens de paiement
            </Link>
            .
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">7. Disponibilité</h2>
          <p className="mt-3">
            Seuls les produits marqués disponibles peuvent être commandés. Un article « bientôt
            disponible » ne peut pas être acheté.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">8. Préparation et livraison</h2>
          <p className="mt-3">
            {SHIPPING_OFFERED_SENTENCE} Coût : {shipping.shippingCostEur.toFixed(2)} €. Préparation :
            1 semaine ({delivery.handlingMinBusinessDays} jours ouvrés). Acheminement :{" "}
            {delivery.transitMinBusinessDays} jours ouvrés après expédition. Un e-mail est envoyé à
            la fin de la préparation, puis à l’expédition. Un numéro de suivi n’est communiqué que
            lorsqu’il est disponible. Pour la Suisse, des droits ou taxes d’importation peuvent
            s’appliquer à la réception.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">9. Réception</h2>
          <p className="mt-3">
            Vérifiez le colis à la réception. En cas de dommage visible, signalez-le au transporteur
            si possible et contactez-nous avec des photos.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">10. Rétractation, retours et remboursements</h2>
          <p className="mt-3">
            Droit de rétractation de {returns.returnWindowDays} jours à compter de la réception,
            lorsque le droit français de la consommation s’applique. La procédure, les cas
            d’exclusion légale et le remboursement sont décrits sur la page{" "}
            <Link href="/retours" className="text-navy underline-offset-4 hover:underline">
              Retours et remboursements
            </Link>
            .
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">11. Produits endommagés et garanties</h2>
          <p className="mt-3">
            Garantie légale de conformité ({returns.legalConformityYears} ans) et garantie des vices
            cachés, indépendamment de tout geste commercial. Contact : {identity.email}.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">12. Service client</h2>
          <p className="mt-3">
            {identity.email}
            {identity.phone ? ` — ${identity.phone}` : ""}. {identity.hours}.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">13. Données personnelles</h2>
          <p className="mt-3">
            Le traitement des données est décrit dans la{" "}
            <Link href="/confidentialite" className="text-navy underline-offset-4 hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">14. Litiges</h2>
          <p className="mt-3">
            En cas de différend, contactez d’abord {identity.email}. Conformément à l’article
            L.612-1 du code de la consommation, vous pouvez recourir gratuitement à un médiateur de
            la consommation. Le médiateur n’est pas encore désigné ; son identité sera publiée dès
            qu’il le sera.
          </p>
        </section>
      </div>
    </div>
  );
}
