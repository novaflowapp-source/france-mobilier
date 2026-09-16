import type { Metadata } from "next";
import { getBusinessIdentity } from "@/lib/business/identity";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Questions fréquentes sur la livraison, les retours et les commandes.",
};

export default function FaqPage() {
  const identity = getBusinessIdentity();
  const items = [
    {
      q: "Où livrez-vous ?",
      a: `${SHIPPING_OFFERED_SENTENCE} Un numéro de suivi est communiqué après l’expédition.`,
    },
    {
      q: "Les prix sont-ils TTC ?",
      a: "Oui. Le montant total est confirmé au paiement.",
    },
    {
      q: "Puis-je retourner un produit ?",
      a: "Vous disposez de 14 jours à compter de la réception pour exercer votre droit de rétractation, lorsque le droit français le prévoit.",
    },
    {
      q: "Proposez-vous un accès professionnel ?",
      a: "Oui. Depuis Mon espace, renseignez le SIREN de l’entreprise. L’e-mail et le mot de passe restent les mêmes. Dès que le SIREN est actif, l’accès pro s’ouvre et un e-mail de confirmation est envoyé. Les prochaines commandes portent le nom de l’entreprise. Les prix restent TTC.",
    },
    {
      q: "Comment retrouver une commande ?",
      a: "Dans Mon compte, avec l’e-mail et le code postal utilisés au paiement. Si vous n’aviez pas de compte, un accès est créé après le paiement : identifiant = votre e-mail, mot de passe provisoire indiqué sur la page de confirmation. Une fois connecté, changez ce mot de passe dans Mon compte.",
    },
    {
      q: "Comment vous contacter ?",
      a: `Écrivez-nous à ${identity.email}${identity.phone ? ` ou au ${identity.phone}` : ""}. SAV : ${identity.hours}.`,
    },
  ];
  return (
    <div className="container-page max-w-3xl py-12 md:py-16">
      <p className="eyebrow">Aide</p>
      <h1 className="display mt-3 text-3xl text-navy md:text-4xl">Questions fréquentes</h1>
      <div className="mt-10 space-y-6">
        {items.map((item) => (
          <div key={item.q}>
            <h2 className="font-medium text-navy">{item.q}</h2>
            <p className="mt-2 leading-relaxed text-muted">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
