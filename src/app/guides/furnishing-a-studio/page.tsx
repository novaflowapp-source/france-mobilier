import type { Metadata } from "next";
import Link from "next/link";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/guides/furnishing-a-studio", {
  title: "Furnishing a studio comfortably",
  description:
    "Shallow furniture, extendable tables, and slim storage for a studio or small apartment.",
});

export default function GuideStudioPage() {
  return (
    <article className="container-page max-w-3xl py-10 md:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/">Home</Link> / <Link href="/guides">Guides</Link> /{" "}
        <span className="text-foreground">Studio</span>
      </nav>
      <h1 className="display text-3xl text-navy md:text-4xl">
        Furnishing a studio comfortably
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">
        In 200–375 sq ft, every piece should do more than one job and sit along the wall when possible.
      </p>
      <div className="mt-8 space-y-4 leading-relaxed text-muted">
        <p>
          An{" "}
          <Link
            href="/products/table-a-manger-extensible"
            className="text-navy underline-offset-4 hover:underline"
          >
            extendable dining table
          </Link>{" "}
          stays compact day to day, then opens for meals — better than a fixed oversized table.
        </p>
        <p>
          A{" "}
          <Link href="/products/meuble-tv" className="text-navy underline-offset-4 hover:underline">
            24 cm deep TV stand
          </Link>{" "}
          and a{" "}
          <Link href="/products/meuble-casiers" className="text-navy underline-offset-4 hover:underline">
            20 cm deep cubby unit
          </Link>{" "}
          sit against the wall without eating floor space.
        </p>
        <p>
          Skip cluttering the center of the room with cheap add-ons — they fill photos more often than
          they help daily life.
        </p>
      </div>
      <Link href="/collections/petits-espaces" className="btn btn-primary mt-10 inline-flex">
        Shop small-space furniture
      </Link>
    </article>
  );
}
