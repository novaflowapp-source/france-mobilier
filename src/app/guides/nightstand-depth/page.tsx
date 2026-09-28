import type { Metadata } from "next";
import Link from "next/link";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/guides/nightstand-depth", {
  title: "How deep should a nightstand be?",
  description:
    "Measurements to check for a nightstand in a small bedroom: width, height, clearance.",
});

export default function GuideNightstandPage() {
  return (
    <article className="container-page max-w-3xl py-10 md:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/">Home</Link> / <Link href="/guides">Guides</Link> /{" "}
        <span className="text-foreground">Nightstand</span>
      </nav>
      <h1 className="display text-3xl text-navy md:text-4xl">
        How deep should a nightstand be?
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">
        A nightstand that is too deep gets in the way of the bed, especially in an apartment bedroom.
      </p>
      <div className="mt-8 space-y-4 leading-relaxed text-muted">
        <p>
          The{" "}
          <Link href="/products/table-de-chevet" className="text-navy underline-offset-4 hover:underline">
            rattan nightstand
          </Link>{" "}
          is 50 cm wide and 45 cm tall. Depth is not published yet — better an empty field than a
          made-up measurement.
        </p>
        <p>
          What you can already check: cabinet height (20 cm), leg height (25 cm), and the stretcher
          13 cm from the floor — useful if you need clearance for bed legs or a robot vacuum.
        </p>
        <p>
          In a compact bedroom, also look at width: 50 cm is reasonable on each side of a queen or
          king bed.
        </p>
      </div>
      <Link href="/collections/tables-de-chevet" className="btn btn-primary mt-10 inline-flex">
        Shop nightstands
      </Link>
    </article>
  );
}
