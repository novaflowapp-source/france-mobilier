import type { Metadata } from "next";
import Link from "next/link";
import { ProAccessForm } from "@/components/pro-access-form";
import { store } from "@/config/store";
import { b2bConfig } from "@/lib/b2b";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/trade", {
  title: "France Mobilier Pro | Trade & professionals",
  description:
    "France Mobilier Pro: company profiles, quotes, and furniture orders for fit-out, hospitality, food service, and business spaces.",
});

const benefits = [
  {
    title: "Business billing",
    text: "Order directly in your company name.",
  },
  {
    title: "Quote requests",
    text: "Get a tailored proposal for projects and volume orders.",
  },
  {
    title: "Dedicated support",
    text: "Reach France Mobilier for specific requirements.",
  },
  {
    title: "Trade terms",
    text: "Tailored terms may be available depending on products and volumes.",
  },
];

export default function ProfessionnelsPage() {
  const sales = b2bConfig().salesEmail;
  return (
    <div className="container-page py-10 md:py-16">
      <p className="eyebrow">France Mobilier Pro</p>
      <h1 className="display mt-3 max-w-3xl text-3xl text-navy md:text-4xl">France Mobilier Pro</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-navy">
        Solutions for professionals in fit-out, hospitality, food service, and business environments.
      </p>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">
        Create a Pro account to centralize company details, request quotes, and streamline furniture
        orders.
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
            <p className="font-medium text-navy">Projects of any size</p>
            <p className="mt-2">
              Whether you are furnishing one unit, an office, or multiple rooms, our trade team can
              review your request.
            </p>
            <p className="mt-4 font-medium text-navy">One workspace</p>
            <p className="mt-2">
              Centralize quote requests and trade orders from your account.
            </p>
            <p className="mt-4">
              Trade desk:{" "}
              <a href={`mailto:${sales}`} className="text-navy underline-offset-4 hover:underline">
                {sales}
              </a>
            </p>
            <p className="mt-4">
              Catalog prices are shown in USD. You can also apply from{" "}
              <Link href="/account/company" className="text-navy underline-offset-4 hover:underline">
                My account
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
