import type { MetadataRoute } from "next";
import { collections } from "@/config/store";
import { isSellable } from "@/lib/products/merchandising";
import { listProducts } from "@/lib/products/repository";
import { PAYMENT_METHODS_PATH, paymentMethodHref, paymentMethods } from "@/lib/payment-methods";
import { canonicalUrl, publicOrigin } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = publicOrigin();
  const lastModified = new Date();
  const staticRoutes = [
    "/",
    "/about",
    "/trade",
    "/faq",
    "/contact",
    "/new",
    "/legal",
    "/privacy",
    "/terms",
    PAYMENT_METHODS_PATH,
    ...paymentMethods.map((method) => paymentMethodHref(method.slug)),
    "/returns",
    "/shipping",
    "/guides",
    "/guides/shoe-cabinet-narrow-entry",
    "/guides/furnishing-a-studio",
    "/guides/nightstand-depth",
    "/guides/coffee-table-small-living-room",
  ].map((path) => ({
    url: canonicalUrl(path),
    lastModified,
  }));

  const collectionRoutes = collections
    .filter((collection) => collection.slug !== "maison" && collection.slug !== "rangement")
    .map((collection) => ({
      url: canonicalUrl(`/collections/${collection.slug}`),
      lastModified,
    }));

  const productRoutes = listProducts()
    .filter(isSellable)
    .map((product) => ({
      url: canonicalUrl(`/products/${product.slug}`),
      lastModified,
    }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes].filter(
    (entry) => entry.url.startsWith(origin),
  );
}
