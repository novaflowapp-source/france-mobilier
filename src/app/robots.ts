import type { MetadataRoute } from "next";
import { store } from "@/config/store";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
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
        ],
      },
    ],
    sitemap: `${store.domain.replace(/\/$/, "")}/sitemap.xml`,
  };
}
