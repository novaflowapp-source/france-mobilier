import type { MetadataRoute } from "next";
import { collections } from "@/config/store";
import { isSellable } from "@/lib/products/merchandising";
import { listProducts } from "@/lib/products/repository";
import { canonicalUrl, publicOrigin } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = publicOrigin();
  const lastModified = new Date();
  const staticRoutes = [
    "/",
    "/a-propos",
    "/professionnels",
    "/questions-frequentes",
    "/contact",
    "/nouveautes",
    "/mentions-legales",
    "/confidentialite",
    "/cgv",
    "/retours",
    "/livraison",
    "/guides",
    "/guides/meuble-chaussures-entree-etroite",
    "/guides/amenager-un-studio",
    "/guides/profondeur-table-de-chevet",
    "/guides/quelle-table-petit-salon",
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
      url: canonicalUrl(`/produits/${product.slug}`),
      lastModified,
    }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes].filter(
    (entry) => entry.url.startsWith(origin),
  );
}
