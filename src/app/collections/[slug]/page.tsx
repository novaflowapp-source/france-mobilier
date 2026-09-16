import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { collections } from "@/config/store";
import { canonicalUrl } from "@/lib/seo";
import {
  filterAndSortProducts,
  getCollection,
  listCollectionProducts,
} from "@/lib/products/repository";
import { isLowDepth, isNarrow, isWallMounted } from "@/lib/products/merchandising";
import type { Product } from "@/lib/types/commerce";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
    sort?: string;
    category?: string;
    productType?: string;
    material?: string;
    color?: string;
    maxDepth?: string;
    maxWidth?: string;
    maxHeight?: string;
    maxPrice?: string;
    availability?: string;
  }>;
};

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return {};
  const path = `/collections/${collection.slug}`;
  return {
    title: collection.name,
    description: collection.description,
    alternates: { canonical: canonicalUrl(path) },
    robots: { index: true, follow: true },
    openGraph: { url: canonicalUrl(path) },
  };
}

function Section({ title, products }: { title: string; products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="display text-2xl text-navy">{title}</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const listed = listCollectionProducts(slug);
  const products = filterAndSortProducts(listed, query);
  const image = "image" in collection ? collection.image : undefined;
  const hasActiveFilters = Boolean(
    query.q ||
      query.productType ||
      query.material ||
      query.color ||
      query.maxDepth ||
      query.maxWidth ||
      query.maxHeight ||
      query.maxPrice ||
      query.availability ||
      query.sort,
  );
  const showSmallSpaceSections = slug === "petits-espaces" && !hasActiveFilters;

  return (
    <div>
      {image ? (
        <section className="relative min-h-[42vw] overflow-hidden bg-navy text-white md:min-h-[22rem]">
          <Image src={image} alt="" fill className="object-cover" sizes="100vw" priority={slug === "petits-espaces"} />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/35 to-navy/15" />
          <div className="container-page relative flex min-h-[42vw] items-end py-10 md:min-h-[22rem] md:py-14">
            <div className="max-w-2xl pb-2">
              <p className="eyebrow text-white">Collection</p>
              <h1 className="display mt-3 text-3xl text-white md:text-5xl">{collection.name}</h1>
              <p className="mt-4 text-base text-white/85 md:text-lg">{collection.description}</p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="container-page py-10 md:py-16">
        {!image ? (
          <div className="mb-10 max-w-2xl">
            <nav className="mb-6 text-sm text-muted">
              <Link href="/">Accueil</Link> / <span className="text-foreground">{collection.name}</span>
            </nav>
            <p className="eyebrow">Collection</p>
            <h1 className="display mt-3 text-3xl text-navy md:text-4xl">{collection.name}</h1>
            <p className="mt-4 text-lg text-muted">{collection.description}</p>
          </div>
        ) : (
          <nav className="mb-6 text-sm text-muted">
            <Link href="/">Accueil</Link> / <span className="text-foreground">{collection.name}</span>
          </nav>
        )}

        <ProductFilters products={listed} query={query} />
        <p className="mb-6 text-sm text-muted">
          {products.length} {products.length > 1 ? "meubles" : "meuble"}
        </p>

        {showSmallSpaceSections ? (
          <>
            <Section title="Meubles étroits" products={listed.filter(isNarrow)} />
            <Section title="Faible profondeur" products={listed.filter(isLowDepth)} />
            <Section title="Mobilier extensible" products={listed.filter((product) => product.extensible)} />
            <Section title="Rangements muraux" products={listed.filter(isWallMounted)} />
            <Section title="Mobilier multifonction" products={listed.filter((product) => product.extensible || product.modular)} />
            <Section title="Studio & appartement" products={listed.filter((product) => Boolean(product.smallSpaceFriendly))} />
          </>
        ) : products.length === 0 ? (
          <p className="text-muted">Aucun produit pour ces critères.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
