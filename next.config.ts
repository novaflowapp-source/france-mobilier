import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    const toOrg = [
      { source: "/", destination: "https://francemobilier.org/" },
      { source: "/:path*", destination: "https://francemobilier.org/:path*" },
    ] as const;
    const legacyHosts = [
      "francemobilier.com",
      "www.francemobilier.com",
      "www.francemobilier.org",
    ];
    return [
      { source: "/collections/maison", destination: "/collections/meubles", permanent: true },
      { source: "/collections/rangement", destination: "/collections/entree-rangement", permanent: true },
      { source: "/returns", destination: "/retours", permanent: true },
      { source: "/products/:slug([^/.]+)", destination: "/produits/:slug", permanent: true },
      { source: "/cart", destination: "/panier", permanent: true },
      { source: "/checkout", destination: "/paiement", permanent: true },
      { source: "/about", destination: "/a-propos", permanent: true },
      { source: "/shipping", destination: "/livraison", permanent: true },
      { source: "/privacy", destination: "/confidentialite", permanent: true },
      { source: "/terms", destination: "/cgv", permanent: true },
      { source: "/legal", destination: "/mentions-legales", permanent: true },
      { source: "/faq", destination: "/questions-frequentes", permanent: true },
      { source: "/pro", destination: "/professionnels", permanent: true },
      ...legacyHosts.flatMap((host) =>
        toOrg.map(({ source, destination }) => ({
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
