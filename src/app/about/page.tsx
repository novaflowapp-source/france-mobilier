import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { store } from "@/config/store";
import { getBusinessIdentity } from "@/lib/business/identity";
import { indexableMetadata } from "@/lib/seo";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

export const metadata: Metadata = indexableMetadata("/about", {
  title: "Our story",
  description: `The story of ${store.storeName}: furniture chosen for how we live today.`,
});

const chapters = [
  {
    title: "Starting at home",
    text: "Homes have changed. Rooms are smaller, uses overlap, and the desk lives in the living room. We choose furniture for real life — pieces that add space and comfort.",
  },
  {
    title: "A careful selection",
    text: "Every item enters the catalog because it supports a daily habit: storing, sitting, working, welcoming a pet comfortably. We favor clear shapes, readable dimensions, and obvious uses.",
  },
  {
    title: "A real store",
    text: `${store.storeName} is an online shop operated by ${store.companyName}. Curation happens from ${store.companyCity}, close to the apartments where every inch matters. ${SHIPPING_OFFERED_SENTENCE} Prices in USD.`,
  },
];

export default function AboutPage() {
  const identity = getBusinessIdentity();
  return (
    <div>
      <section className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:py-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
          <Image
            src="/lifestyle/marque.jpg"
            alt="Contemporary furniture detail"
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 50vw"
          />
        </div>
        <div>
          <p className="eyebrow">The brand</p>
          <h1 className="display mt-3 text-3xl text-navy md:text-4xl">A home that’s easier to live in</h1>
          <div className="mt-6 space-y-4 leading-relaxed text-muted">
            <p>
              {store.storeName} started from a simple idea: furniture should make daily life easier.
              Pieces chosen for today’s homes — more useful space, more comfort, solutions that are
              easy to place.
            </p>
            <p>
              {identity.relationship} You will find furniture for the living room, bedroom, entryway,
              and office — a clear selection built around those rooms.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container-page max-w-3xl">
          <p className="eyebrow">Our story</p>
          <h2 className="display mt-3 text-3xl text-navy md:text-4xl">
            A selection born from today’s homes.
          </h2>
          <p className="mt-6 leading-relaxed text-muted">
            The story of {store.storeName} begins with how people actually live: studios, apartments,
            multi-use rooms. A desk in the living room, the need for something that fits and still
            looks good. The shop grew around that need — offering what truly helps.
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            We kept a clear line: useful furniture, storage that frees space, pieces that install
            without fuss. That standard still guides every catalog addition.
          </p>
        </div>
        <div className="container-page mt-12 grid gap-8 md:grid-cols-3">
          {chapters.map((chapter) => (
            <div key={chapter.title}>
              <h3 className="font-medium text-navy">{chapter.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{chapter.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-page grid items-center gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
            <Image
              src="/lifestyle/petits-espaces.jpg"
              alt="Well-organized studio with compact furniture"
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="eyebrow">Today</p>
            <h2 className="display mt-3 text-3xl text-navy md:text-4xl">
              Same focus: furniture that earns its place.
            </h2>
            <p className="mt-5 leading-relaxed text-muted">
              The catalog has grown — living room, bedroom, entryway, office — with the same method.
              We keep what serves daily use, fits the dimensions, installs simply, and looks good
              every day.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              {identity.relationship} {SHIPPING_OFFERED_SENTENCE} 14-day store returns, support{" "}
              {identity.hoursShort}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/collections/meubles" className="btn btn-primary w-full sm:w-auto">
                Shop furniture
              </Link>
              <Link href="/contact" className="btn btn-secondary w-full sm:w-auto">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
