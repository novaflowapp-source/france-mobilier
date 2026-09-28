import type { Metadata } from "next";
import Link from "next/link";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/guides/shoe-cabinet-narrow-entry", {
  title: "Shoe storage for a narrow entryway",
  description:
    "How to choose shoe storage when the hallway is tight: depth, seating, sliding doors.",
});

export default function GuideEntryPage() {
  return (
    <article className="container-page max-w-3xl py-10 md:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/">Home</Link> / <Link href="/guides">Guides</Link> /{" "}
        <span className="text-foreground">Narrow entryway</span>
      </nav>
      <h1 className="display text-3xl text-navy md:text-4xl">
        Shoe storage for a narrow entryway
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">
        In a hallway, depth matters more than width. A piece that sticks out blocks the door, the
        path, sometimes a radiator.
      </p>
      <div className="mt-8 space-y-4 leading-relaxed text-muted">
        <p>
          When depth is known, choose something that stays flush to the wall. Our{" "}
          <Link href="/products/meuble-casiers" className="text-navy underline-offset-4 hover:underline">
            cubby unit
          </Link>{" "}
          is 20 cm deep: it stores shoes and keeps the path clear.
        </p>
        <p>
          The{" "}
          <Link href="/products/meuble-entree" className="text-navy underline-offset-4 hover:underline">
            entryway bench / shoe cabinet
          </Link>{" "}
          doubles as seating. Depth will be published as soon as it is confirmed — we prefer a blank
          field to a guessed number.
        </p>
        <p>
          A slim vertical shoe cabinet can work when you want closed storage. One option is marked
          coming soon in the catalog.
        </p>
      </div>
      <Link href="/collections/meubles-chaussures" className="btn btn-primary mt-10 inline-flex">
        Shop shoe storage
      </Link>
    </article>
  );
}
