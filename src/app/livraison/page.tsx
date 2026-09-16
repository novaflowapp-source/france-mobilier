import type { Metadata } from "next";
import Link from "next/link";
import { getShippingPolicy } from "@/lib/business/policies";
import { getDefaultDeliveryProfile } from "@/lib/merchant/delivery";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

export const metadata: Metadata = {
  title: "Livraison",
  description: "Zones, coût, suivi et délais de livraison France Mobilier.",
};

export default function ShippingPage() {
  const shipping = getShippingPolicy();
  const delivery = getDefaultDeliveryProfile();

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Livraison</h1>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-xl font-semibold text-navy">Zones</h2>
          <p className="mt-3">
            {SHIPPING_OFFERED_SENTENCE} Pas de livraison vers les DOM-TOM ni hors de cette zone.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">Coût</h2>
          <p className="mt-3">
            Livraison offerte : {shipping.shippingCostEur.toFixed(2)} €. Pour la Suisse, des droits
            ou taxes d’importation peuvent être demandés à la réception. Ils ne sont pas inclus dans
            le prix payé sur le site.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">Préparation et acheminement</h2>
          <p className="mt-3">
            Préparation : 1 semaine ({delivery.handlingMinBusinessDays} jours ouvrés) après
            paiement. Acheminement : {delivery.transitMinBusinessDays} jours ouvrés après
            expédition. Lorsqu’un meuble est fabriqué après commande, ces délais commencent à la
            commande. Nous n’affichons pas de date de réception fixe.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-navy">Suivi</h2>
          <p className="mt-3">
            Un e-mail est envoyé à la fin de la préparation (selon le délai annoncé), puis à
            l’expédition du colis. Un numéro de suivi n’est communiqué que lorsqu’il est disponible
            auprès du transporteur.
          </p>
        </section>
      </div>
      <Link href="/collections/meubles" className="btn btn-secondary mt-8 inline-flex">
        Voir la sélection
      </Link>
    </div>
  );
}
