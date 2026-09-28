import type { Metadata } from "next";
import Link from "next/link";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/guides/coffee-table-small-living-room", {
  title: "Tables for a small living room",
  description:
    "Coffee or extendable dining tables when the living room is tight: depth, extension, circulation.",
});

export default function GuideSmallLivingTablePage() {
  return (
    <article className="container-page max-w-3xl py-10 md:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/">Home</Link> / <Link href="/guides">Guides</Link> /{" "}
        <span className="text-foreground">Small living room</span>
      </nav>
      <h1 className="display text-3xl text-navy md:text-4xl">Tables for a small living room</h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">
        In a compact living room, a table should keep circulation easy. Depth and the option to extend
        matter as much as seat count.
      </p>
      <div className="mt-8 space-y-4 leading-relaxed text-muted">
        <p>
          For everyday use, a slim coffee table is often enough. Our{" "}
          <Link href="/products/metal-coffee-table" className="text-navy underline-offset-4 hover:underline">
            coffee table
          </Link>{" "}
          stays light in the center of the room.
        </p>
        <p>
          If the living room also serves as dining space, an extendable table helps. The{" "}
          <Link
            href="/products/extendable-dining-table"
            className="text-navy underline-offset-4 hover:underline"
          >
            extendable dining table
          </Link>{" "}
          stays small most days, then opens when you host.
        </p>
        <p>
          Before buying, measure clearance around the sofa, doors, and path to the entryway. A piece
          that is too deep cuts the room in half, even if it looks great in photos.
        </p>
      </div>
      <Link href="/collections/living-room" className="btn btn-primary mt-10 inline-flex">
        Shop living room furniture
      </Link>
    </article>
  );
}
