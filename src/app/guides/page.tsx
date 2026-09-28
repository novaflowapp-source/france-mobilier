import type { Metadata } from "next";
import Link from "next/link";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/guides", {
  title: "Guides & inspiration",
  description:
    "Short guides to choose furniture by room, depth, and small-space layouts.",
});

const guides = [
  {
    href: "/guides/shoe-cabinet-narrow-entry",
    title: "Shoe storage for a narrow entryway",
    text: "How to read depth and keep the path clear.",
  },
  {
    href: "/guides/nightstand-depth",
    title: "How deep should a nightstand be?",
    text: "Measurements to check before you buy, especially in a small bedroom.",
  },
  {
    href: "/guides/furnishing-a-studio",
    title: "Furnishing a studio comfortably",
    text: "Extendable, shallow, multifunction pieces that make the room work harder.",
  },
  {
    href: "/guides/coffee-table-small-living-room",
    title: "Tables for a small living room",
    text: "Coffee or extendable dining tables for a smoother layout.",
  },
];

export default function GuidesPage() {
  return (
    <div className="container-page py-10 md:py-16">
      <p className="eyebrow">Guides</p>
      <h1 className="display mt-3 text-3xl text-navy md:text-4xl">Guides & inspiration</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Practical articles tied to pieces in the store.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="rounded-[var(--radius)] border border-border bg-white p-5 hover:bg-cream"
          >
            <h2 className="font-medium text-navy">{guide.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{guide.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
