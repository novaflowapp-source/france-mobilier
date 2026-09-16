import type { MetadataRoute } from "next";
import { publicOrigin } from "@/lib/seo";

const privatePaths = [
  "/admin",
  "/panier",
  "/paiement",
  "/commande",
  "/api/",
  "/compte",
  "/connexion",
  "/inscription",
  "/mot-de-passe-oublie",
  "/nouveau-mot-de-passe",
];

const googleCrawlers = [
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-Mobile",
  "AdsBot-Google",
  "AdsBot-Google-Mobile",
  "Google-InspectionTool",
  "Storebot-Google",
];

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      {
        userAgent: googleCrawlers,
        allow: ["/", "/produits/", "/collections/", "/guides/"],
        disallow: privatePaths,
      },
    ],
    sitemap: `${publicOrigin()}/sitemap.xml`,
  };
}
