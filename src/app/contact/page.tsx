import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { formatPublicAddress, getBusinessIdentity } from "@/lib/business/identity";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/contact", {
  title: "Contact",
  description: "Contacter France Mobilier : e-mail, formulaire et coordonnées de l’entreprise.",
});

export default function ContactPage() {
  const identity = getBusinessIdentity();
  const address = formatPublicAddress(identity);

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="display text-3xl text-navy md:text-4xl">Contact</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Une question sur une commande, un produit ou la livraison ? Écrivez-nous.
      </p>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <ContactForm />
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted">
          <p className="font-medium text-foreground">{identity.storeName}</p>
          <p className="mt-2">{identity.relationship}</p>
          {address ? <p className="mt-3">{address}</p> : null}
          <p className="mt-3">
            <a href={`mailto:${identity.email}`} className="text-navy underline-offset-4 hover:underline">
              {identity.email}
            </a>
          </p>
          {identity.phone ? (
            <p className="mt-2">
              <a href={`tel:${identity.phone.replace(/\s+/g, "")}`} className="text-navy underline-offset-4 hover:underline">
                {identity.phone}
              </a>
            </p>
          ) : null}
          <p className="mt-3">SAV : {identity.hours}.</p>
        </div>
      </div>
    </div>
  );
}
