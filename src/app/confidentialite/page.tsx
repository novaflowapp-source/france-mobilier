import type { Metadata } from "next";
import { store } from "@/config/store";
import { CookieManageButton } from "@/components/cookie-manage-button";

export const metadata: Metadata = { title: "Confidentialité" };

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Politique de confidentialité</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
        <p>{store.storeName} traite les données nécessaires au fonctionnement de la boutique :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>contact : nom, e-mail, message ;</li>
          <li>compte client : nom, e-mail, mot de passe hashé ;</li>
          <li>
            réinitialisation de mot de passe : e-mail contenant un lien temporaire, valable une
            heure ;
          </li>
          <li>
            accès professionnel : SIREN / SIRET, dénomination issue du répertoire Sirene, liés au
            compte — sans pièce d’identité ;
          </li>
          <li>commande : nom, e-mail, téléphone, adresse de livraison et historique d’achat ;</li>
          <li>paiement par carte : traité par le prestataire de paiement ;</li>
          <li>journaux techniques d’hébergement.</li>
        </ul>
        <p>
          Base légale : exécution du contrat, obligation légale ou intérêt légitime selon le
          traitement. Droits RGPD (accès, rectification, effacement) : {store.supportEmail}.
        </p>
        <h2 id="cookies" className="scroll-mt-28 pt-4 text-xl font-semibold tracking-tight text-navy">
          Cookies
        </h2>
        <p>
          Des cookies et un stockage local sont utilisés pour faire fonctionner la boutique :
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>compte et session de connexion ;</li>
          <li>panier (enregistré dans le navigateur) ;</li>
          <li>accès à une commande payée ;</li>
          <li>paiement, traité sur la page Stripe selon la politique de Stripe.</li>
        </ul>
        <p>
          Si vous acceptez les cookies non essentiels, le tag Google Ads (AW-17892406919) mesure
          les campagnes et l’achat confirmé. Sans accord, le tag reste en place mais les cookies
          publicitaires restent refusés. Vous pouvez modifier votre choix à tout moment.
        </p>
        <p>
          <CookieManageButton className="btn btn-secondary">Modifier mes choix</CookieManageButton>
        </p>
      </div>
    </div>
  );
}
