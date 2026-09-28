import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { IconHeadset, IconRuler, IconSofa, IconTruck } from "@/components/icons";
import { store } from "@/config/store";
import { listFeaturedProducts, listSellableProducts } from "@/lib/products/repository";
import { indexableMetadata } from "@/lib/seo";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

export const metadata: Metadata = indexableMetadata("/");

const rooms = [
  {
    slug: "salon",
    image: "/lifestyle/maison.jpg",
    title: "Living room",
    text: "Tables, TV stands, compact pieces.",
  },
  {
    slug: "chambre",
    image: "/lifestyle/marque.jpg",
    title: "Bedroom",
    text: "Nightstands and useful small furniture.",
  },
  {
    slug: "entree-rangement",
    image: "/lifestyle/rangement.jpg",
    title: "Entryway",
    text: "Slim storage and shoe cabinets.",
  },
  {
    slug: "bureau",
    image: "/lifestyle/bureau.jpg",
    title: "Office",
    text: "Work from home, comfortably.",
  },
] as const;

const guarantees = [
  {
    title: "Built for smaller spaces",
    text: "Furniture chosen to make the most of your layout.",
    icon: IconSofa,
  },
  {
    title: "Detailed dimensions",
    text: "See right away whether a piece fits your room.",
    icon: IconRuler,
  },
  {
    title: "Tracked shipping",
    text: "Clear updates from dispatch to delivery.",
    icon: IconTruck,
  },
  {
    title: "Customer support",
    text: `Support ${store.supportHoursShort}.`,
    icon: IconHeadset,
  },
];

export default function HomePage() {
  const featured = listFeaturedProducts(8);
  const selection = featured.slice(0, 8);
  const entryUniverse = listSellableProducts()
    .filter((product) => product.rooms?.includes("entree"))
    .slice(0, 4);

  return (
    <div>
      <section className="relative min-h-[70svh] overflow-hidden bg-navy text-white md:min-h-[84vh]">
        <Image
          src="/lifestyle/hero.jpg"
          alt="Contemporary interior with light, airy furniture"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/40 to-navy/20 md:bg-gradient-to-r md:from-navy/80 md:via-navy/45 md:to-navy/15" />
        <div className="container-page relative flex min-h-[70svh] items-end py-12 md:min-h-[84vh] md:items-center md:py-24">
          <div className="max-w-xl pb-2">
            <p className="eyebrow text-white">
              <span className="text-white">A considered selection</span>
            </p>
            <h1 className="display mt-4 text-[1.85rem] text-white sm:text-4xl md:text-6xl">
              Furniture that simplifies your home.
            </h1>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-white/85 md:mt-5 md:text-lg">
              Pieces chosen for everyday comfort, space, and simplicity.
            </p>
            <div className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap">
              <Link href="/collections/meubles" className="btn btn-inverse w-full sm:w-auto">
                Shop furniture
              </Link>
              <Link href="/collections/petits-espaces" className="btn btn-on-dark w-full sm:w-auto">
                Small spaces
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="container-page grid grid-cols-2 gap-x-4 gap-y-5 py-7 md:grid-cols-4 md:gap-8 md:py-10">
          {guarantees.map((item) => (
            <div key={item.title} className="flex gap-2.5">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
              <div>
                <p className="text-sm font-semibold text-navy">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted md:text-sm">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <p className="eyebrow">Rooms</p>
          <h2 className="display mt-3 text-[1.75rem] text-navy md:text-4xl">Shop by room</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((item) => (
              <Link
                key={item.slug}
                href={`/collections/${item.slug}`}
                className="group relative min-h-52 overflow-hidden rounded-[var(--radius)] sm:min-h-64"
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-navy/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 px-6 py-5 text-white">
                  <h3 className="display text-2xl">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/85">{item.text}</p>
                  <p className="mt-3 text-sm text-white/90">View selection →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container-page">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Selection</p>
              <h2 className="display mt-3 text-3xl text-navy md:text-4xl">France Mobilier essentials</h2>
              <p className="mt-3 max-w-xl text-muted">
                A short list of furniture chosen for everyday use and clear dimensions.
              </p>
            </div>
            <Link href="/collections/meubles" className="btn btn-secondary w-full sm:w-auto">
              All furniture
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {selection.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid items-center gap-10 md:grid-cols-2">
          <div className="md:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
              <Image
                src="/lifestyle/petits-espaces.jpg"
                alt="Compact, bright interior with space-saving furniture"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          <div>
            <p className="eyebrow">Small spaces</p>
            <h2 className="display mt-3 text-3xl text-navy md:text-4xl">Small spaces, real comfort.</h2>
            <p className="mt-5 leading-relaxed text-muted">
              Furniture for apartments, studios, and rooms where every inch counts.
            </p>
            <Link href="/collections/petits-espaces" className="btn btn-primary mt-8 w-full sm:w-auto">
              Shop small spaces
            </Link>
          </div>
        </div>
      </section>

      {entryUniverse.length > 1 ? (
        <section className="section section-cream">
          <div className="container-page">
            <p className="eyebrow">Focus</p>
            <h2 className="display mt-3 text-3xl text-navy md:text-4xl">For the entryway</h2>
            <p className="mt-3 max-w-xl text-muted">
              Pieces that sit along a hallway and keep the path clear.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {entryUniverse.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container-page grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="eyebrow">Guides</p>
            <h2 className="display mt-3 text-3xl text-navy md:text-4xl">Choose better, room by room</h2>
            <p className="mt-5 leading-relaxed text-muted">
              Short guides on dimensions, studio layouts, and narrow entryway furniture.
            </p>
            <Link href="/guides" className="btn btn-secondary mt-8 w-full sm:w-auto">
              Guides & inspiration
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
            <Image
              src="/lifestyle/rangement.jpg"
              alt="Storage along a light wall"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container-page grid items-center gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
            <Image
              src="/lifestyle/marque.jpg"
              alt="Detail of contemporary light wood furniture"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="eyebrow">The brand</p>
            <h2 className="display mt-3 text-3xl text-navy md:text-4xl">A selection with purpose.</h2>
            <p className="mt-5 leading-relaxed text-muted">
              At {store.storeName}, every piece adds comfort, order, and clarity — for today’s homes:
              apartments, studios, and work-from-home setups.
            </p>
            <Link href="/about" className="btn btn-primary mt-8 w-full sm:w-auto">
              Our story
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-navy text-white">
        <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between md:py-16">
          <div className="max-w-2xl">
            <p className="eyebrow text-white">Trade</p>
            <h2 className="display mt-3 text-[1.85rem] text-white sm:text-4xl md:text-5xl">
              France Mobilier Pro
            </h2>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-white/85 md:text-lg">
              Furnishing offices, rentals, or commercial spaces? Request a quote for volume orders.
            </p>
            <p className="mt-3 text-sm text-white/55">
              Tailored terms may be available depending on products and volumes.
            </p>
          </div>
          <Link href="/trade" className="btn btn-inverse w-full shrink-0 text-base sm:w-auto md:min-h-12 md:px-8">
            Explore Pro
          </Link>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container-page grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="display text-3xl text-navy">Shipping & returns</h2>
            <p className="mt-4 leading-relaxed text-muted">
              {SHIPPING_OFFERED_SENTENCE} You have 14 days from delivery to request a store return
              (see our returns policy).
            </p>
            <div className="mt-5 flex gap-4 text-sm">
              <Link href="/shipping" className="text-navy underline-offset-4 hover:underline">
                Shipping
              </Link>
              <Link href="/returns" className="text-navy underline-offset-4 hover:underline">
                Returns
              </Link>
            </div>
          </div>
          <div>
            <h2 className="display text-3xl text-navy">FAQ</h2>
            <div className="mt-5 space-y-4">
              <div>
                <p className="font-medium text-navy">Where do you ship?</p>
                <p className="mt-1 text-sm text-muted">
                  {SHIPPING_OFFERED_SENTENCE} Tracking is shared when your order ships.
                </p>
              </div>
              <div>
                <p className="font-medium text-navy">Are prices in USD?</p>
                <p className="mt-1 text-sm text-muted">Yes. Your total is confirmed at checkout.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
