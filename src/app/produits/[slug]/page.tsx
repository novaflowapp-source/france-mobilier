import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDailyUse } from "@/components/product-daily-use";
import { ProductDimensions } from "@/components/product-dimensions";
import { ProductFAQ } from "@/components/product-faq";
import { ProductHighlights } from "@/components/product-highlights";
import { ProductMedia } from "@/components/product-media";
import { ProductRecommendations } from "@/components/product-recommendations";
import { ProductReviews } from "@/components/product-reviews";
import { ProductViewTracker } from "@/components/product-view-tracker";
import { ProductShippingReturns } from "@/components/product-shipping-returns";
import { ProductSpecifications } from "@/components/product-specifications";
import { store } from "@/config/store";
import { schemaAvailability } from "@/lib/merchant/delivery";
import { getPublicPrice } from "@/lib/merchant/price";
import {
  collectionSlugForProductPage,
  findCollectionProducts,
  findProductBySlug,
  findRelatedProducts,
  getCollection,
  listProducts,
} from "@/lib/products/repository";
import {
  productGalleryImages,
  productHeroImage,
  productHighlights,
} from "@/lib/products/presentation";
import { listApprovedReviews } from "@/lib/reviews";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
};

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return listProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) return {};
  const hero = productHeroImage(product);
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `${store.domain}/produits/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: `${store.domain}/produits/${product.slug}`,
      images: [hero, ...product.images.filter((src) => src !== hero)].map((url) => ({ url })),
    },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { variant: variantParam } = await searchParams;
  const product = findProductBySlug(slug);
  if (!product) notFound();
  const collectionProducts = findCollectionProducts(product);
  const related = findRelatedProducts(product).filter(
    (item) => !collectionProducts.some((member) => member.id === item.id),
  );
  const reviews = await listApprovedReviews(product.id);
  const collectionSlug = collectionSlugForProductPage(product);
  const collection = getCollection(collectionSlug);
  const gallery = productGalleryImages(product);
  const hero = productHeroImage(product);
  const highlights = productHighlights(product);

  const variants = product.variants ?? [];
  const publicPrices = (variants.length ? variants : [null]).map((variant) =>
    getPublicPrice(product, variant),
  );
  const lowPrice = Math.min(...publicPrices.map((row) => row.amount));
  const highPrice = Math.max(...publicPrices.map((row) => row.amount));
  const availability = schemaAvailability(product);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.alternateNames?.length ? { alternateName: product.alternateNames } : {}),
    description: product.description,
    image: [hero, ...gallery.filter((src) => src !== hero)].map((src) => `${store.domain}${src}`),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    offers:
      variants.length > 1
        ? variants.map((variant) => {
            const price = getPublicPrice(product, variant);
            return {
              "@type": "Offer",
              url: `${store.domain}/produits/${product.slug}?variant=${encodeURIComponent(variant.id)}`,
              priceCurrency: "EUR",
              price: price.amount,
              availability,
              itemCondition: "https://schema.org/NewCondition",
            };
          })
        : {
            "@type": "Offer",
            url: `${store.domain}/produits/${product.slug}`,
            priceCurrency: "EUR",
            price: getPublicPrice(product).amount,
            lowPrice,
            highPrice,
            availability,
            itemCondition: "https://schema.org/NewCondition",
          },
    ...(reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (
              reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            ).toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: store.domain },
      {
        "@type": "ListItem",
        position: 2,
        name: collection?.name ?? "Catalogue",
        item: `${store.domain}/collections/${collectionSlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${store.domain}/produits/${product.slug}`,
      },
    ],
  };

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden bg-white pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-0">
      <ProductViewTracker
        productId={product.id}
        productName={product.name}
        priceEur={getPublicPrice(product).amount}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="container-page py-8 md:py-12">
        <nav className="mb-6 text-sm text-muted">
          <Link href="/">Accueil</Link>
          <span> / </span>
          <Link href={`/collections/${collectionSlug}`}>{collection?.name ?? "Catalogue"}</Link>
          <span> / </span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <ProductMedia product={product} images={gallery} initialVariantId={variantParam} />
      </div>

      <ProductHighlights items={highlights} />
      <ProductDailyUse items={product.dailyUses ?? []} />
      <ProductDimensions product={product} />
      <ProductSpecifications product={product} />
      <ProductShippingReturns product={product} />
      <ProductFAQ product={product} />
      <ProductReviews productId={product.id} initialReviews={reviews} />
      {collectionProducts.length > 0 ? (
        <ProductRecommendations title="Complétez la collection" products={collectionProducts} />
      ) : null}
      <ProductRecommendations products={related} />
    </div>
  );
}
