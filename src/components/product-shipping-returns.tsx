import Link from "next/link";
import { deliveryLabel } from "@/lib/products/presentation";
import { SHIPPING_OFFERED_SENTENCE, SHIPPING_ZONE_LABEL } from "@/lib/shipping-zone";
import type { Product } from "@/lib/types/commerce";

export function ProductShippingReturns({ product }: { product: Product }) {
  const delivery = deliveryLabel(product);

  return (
    <section className="section">
      <div className="container-page">
        <h2 className="display text-3xl text-navy">Livraison et retours</h2>
        <div className="prose-narrow mt-8 grid gap-8 md:grid-cols-2">
          <div className="space-y-3 text-[0.95rem] leading-relaxed text-muted">
            <p>
              <span className="font-medium text-navy">Zones desservies. </span>
              {SHIPPING_OFFERED_SENTENCE} Pas de livraison vers les DOM-TOM ni hors de cette zone.
            </p>
            <p>
              <span className="font-medium text-navy">Coût. </span>
              Livraison offerte. Pour la Suisse, des droits ou taxes d’importation peuvent être demandés à la
              réception ; ils ne sont pas inclus dans le prix payé sur le site.
            </p>
            {delivery ? (
              <p>
                <span className="font-medium text-navy">Livraison. </span>
                {product.madeToOrder
                  ? `Article fabriqué après commande. ${delivery.charAt(0).toUpperCase()}${delivery.slice(1)}. La date de réception n’est pas connue à l’avance.`
                  : `${delivery.charAt(0).toUpperCase()}${delivery.slice(1)}.`}
              </p>
            ) : (
              <p>
                <span className="font-medium text-navy">Délais. </span>
                Les délais estimés figurent au moment de la commande lorsque nous les connaissons. Nous
                n’affichons pas de date de réception si elle n’est pas établie.
              </p>
            )}
          </div>
          <div className="space-y-3 text-[0.95rem] leading-relaxed text-muted">
            <p>
              <span className="font-medium text-navy">Suivi. </span>
              Un numéro de suivi est communiqué par e-mail après l’expédition.
            </p>
            <p>
              <span className="font-medium text-navy">Retours. </span>
              14 jours à compter de la réception pour exercer le droit de rétractation, lorsque le droit
              français de la consommation s’applique. Le produit doit être renvoyé dans un état permettant sa
              revente.
            </p>
            <p>
              <Link href="/livraison" className="text-navy underline-offset-4 hover:underline">
                Livraison
              </Link>
              {" · "}
              <Link href="/retours" className="text-navy underline-offset-4 hover:underline">
                Retours et remboursements
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
