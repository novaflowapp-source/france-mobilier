import type { NextConfig } from "next";
import {
  COLLECTION_SLUG_REDIRECTS,
  PAYMENT_METHOD_SLUG_REDIRECTS,
  PRODUCT_SLUG_REDIRECTS,
} from "./config/legacy-slugs";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    const toCom = [
      { source: "/", destination: "https://francemobilier.com/" },
      { source: "/:path*", destination: "https://francemobilier.com/:path*" },
    ] as const;
    const legacyHosts = [
      "francemobilier.org",
      "www.francemobilier.org",
      "www.francemobilier.com",
    ];
    return [
      // French → English collection / product path slugs
      ...Object.entries(COLLECTION_SLUG_REDIRECTS).map(([from, to]) => ({
        source: `/collections/${from}`,
        destination: `/collections/${to}`,
        permanent: true,
      })),
      ...Object.entries(PRODUCT_SLUG_REDIRECTS).map(([from, to]) => ({
        source: `/products/${from}`,
        destination: `/products/${to}`,
        permanent: true,
      })),
      ...Object.entries(PRODUCT_SLUG_REDIRECTS).map(([from, to]) => ({
        source: `/produits/${from}`,
        destination: `/products/${to}`,
        permanent: true,
      })),
      ...Object.entries(PAYMENT_METHOD_SLUG_REDIRECTS).map(([from, to]) => ({
        source: `/terms/payment-methods/${from}`,
        destination: `/terms/payment-methods/${to}`,
        permanent: true,
      })),
      ...Object.entries(PAYMENT_METHOD_SLUG_REDIRECTS).map(([from, to]) => ({
        source: `/cgv/moyens-de-paiement/${from}`,
        destination: `/terms/payment-methods/${to}`,
        permanent: true,
      })),
      // French → English storefront paths
      { source: "/panier", destination: "/cart", permanent: true },
      { source: "/paiement", destination: "/checkout", permanent: true },
      { source: "/produits/:slug*", destination: "/products/:slug*", permanent: true },
      { source: "/commande/confirmation", destination: "/order/confirmation", permanent: true },
      { source: "/commande/:path*", destination: "/order/:path*", permanent: true },
      { source: "/compte/devis", destination: "/account/quotes", permanent: true },
      { source: "/compte/factures", destination: "/account/invoices", permanent: true },
      { source: "/compte/entreprise", destination: "/account/company", permanent: true },
      { source: "/compte", destination: "/account", permanent: true },
      { source: "/connexion", destination: "/login", permanent: true },
      { source: "/inscription", destination: "/signup", permanent: true },
      { source: "/mot-de-passe-oublie", destination: "/forgot-password", permanent: true },
      { source: "/nouveau-mot-de-passe", destination: "/reset-password", permanent: true },
      { source: "/livraison", destination: "/shipping", permanent: true },
      { source: "/retours", destination: "/returns", permanent: true },
      { source: "/a-propos", destination: "/about", permanent: true },
      { source: "/confidentialite", destination: "/privacy", permanent: true },
      { source: "/cgv/moyens-de-paiement/:slug*", destination: "/terms/payment-methods/:slug*", permanent: true },
      { source: "/cgv/moyens-de-paiement", destination: "/terms/payment-methods", permanent: true },
      { source: "/cgv", destination: "/terms", permanent: true },
      { source: "/mentions-legales", destination: "/legal", permanent: true },
      { source: "/questions-frequentes", destination: "/faq", permanent: true },
      { source: "/nouveautes", destination: "/new", permanent: true },
      { source: "/professionnels", destination: "/trade", permanent: true },
      { source: "/recherche", destination: "/search", permanent: true },
      { source: "/pro", destination: "/trade", permanent: true },
      { source: "/admin/activite", destination: "/admin/activity", permanent: true },
      { source: "/admin/devis", destination: "/admin/quotes", permanent: true },
      { source: "/admin/mots-cles", destination: "/admin/keywords", permanent: true },
      { source: "/admin/professionnels/:path*", destination: "/admin/professionals/:path*", permanent: true },
      { source: "/guides/amenager-un-studio", destination: "/guides/furnishing-a-studio", permanent: true },
      {
        source: "/guides/meuble-chaussures-entree-etroite",
        destination: "/guides/shoe-cabinet-narrow-entry",
        permanent: true,
      },
      { source: "/guides/profondeur-table-de-chevet", destination: "/guides/nightstand-depth", permanent: true },
      {
        source: "/guides/quelle-table-petit-salon",
        destination: "/guides/coffee-table-small-living-room",
        permanent: true,
      },
      ...legacyHosts.flatMap((host) =>
        toCom.map(({ source, destination }) => ({
          source,
          destination,
          permanent: true,
          has: [{ type: "host" as const, value: host }],
        })),
      ),
    ];
  },
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
