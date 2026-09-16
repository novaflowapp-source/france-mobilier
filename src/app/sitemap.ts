import type { MetadataRoute } from "next";
import { store } from "@/config/store";
import { collections } from "@/config/store";
import { isSellable } from "@/lib/products/merchandising";
import { listProducts } from "@/lib/products/repository";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = store.domain.replace(/\/$/, "");
  const staticRoutes = [
    "",
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
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
  }));

  const collectionRoutes = collections
    .filter((collection) => collection.slug !== "maison" && collection.slug !== "rangement")
    .map((c) => ({
      url: `${base}/collections/${c.slug}`,
      lastModified: new Date(),
    }));

  const productRoutes = listProducts()
    .filter(isSellable)
    .map((p) => ({
      url: `${base}/produits/${p.slug}`,
      lastModified: new Date(),
    }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
