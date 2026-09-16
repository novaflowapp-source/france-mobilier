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
