import type { Metadata } from "next";
import { getBusinessIdentity } from "@/lib/business/identity";
import { indexableMetadata } from "@/lib/seo";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

export const metadata: Metadata = indexableMetadata("/faq", {
  title: "FAQ",
  description: "Frequently asked questions about shipping, returns, and orders.",
});

export default function FaqPage() {
  const identity = getBusinessIdentity();
  const items = [
    {
      q: "Where do you ship?",
      a: `${SHIPPING_OFFERED_SENTENCE} A tracking number is shared when your order ships.`,
    },
    {
      q: "Are prices in USD?",
      a: "Yes. The total you pay is confirmed at checkout.",
    },
    {
      q: "How does promo code WELCOME work?",
      a: "Code WELCOME gives 10% off your entire first order (not a single item). Enter it at checkout with your US phone number: one use per phone number. It cannot be combined with trade pricing.",
    },
    {
      q: "Can I return a product?",
      a: "You have 14 days from delivery to request a return under our store returns policy. See Returns for steps and exclusions.",
    },
    {
      q: "Do you offer trade / Pro access?",
      a: "Yes. In My account, add your company SIREN (French business ID). Your email and password stay the same. Once verified, Pro access opens and you receive a confirmation email. Future orders can show your company name. Catalog prices remain as shown in USD.",
    },
    {
      q: "How do I find an order?",
      a: "In My account, use the email and shipping ZIP from checkout. If you did not have an account, one is created after payment: sign-in email = your email, temporary password on the confirmation page. Change that password in My account after signing in.",
    },
    {
      q: "How can I contact you?",
      a: `Email ${identity.email}${identity.phone ? ` or call ${identity.phone}` : ""}. Support: ${identity.hours}.`,
    },
  ];
  return (
    <div className="container-page max-w-3xl py-12 md:py-16">
      <p className="eyebrow">Help</p>
      <h1 className="display mt-3 text-3xl text-navy md:text-4xl">Frequently asked questions</h1>
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
