import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { GoogleConsentSync } from "@/components/google-consent-sync";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { store } from "@/config/store";
import { GOOGLE_ADS_ID, gtagBootstrap } from "@/lib/ads/gtag";
import { organizationJsonLd } from "@/lib/business/identity";
import { publicOrigin } from "@/lib/seo";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(publicOrigin()),
  title: {
    default: `${store.storeName} — Le mobilier qui simplifie votre intérieur`,
    template: `%s | ${store.storeName}`,
  },
  description: store.storeTagline,
  openGraph: {
    title: store.storeName,
    description: store.storeTagline,
    locale: "fr_FR",
    type: "website",
    url: publicOrigin(),
    siteName: store.storeName,
    images: [{ url: store.logoPath, alt: store.storeName }],
  },
  twitter: {
    card: "summary",
    title: store.storeName,
    description: store.storeTagline,
    images: [store.logoPath],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const orgJsonLd = organizationJsonLd();
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: store.storeName,
    url: publicOrigin(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${publicOrigin()}/recherche?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="fr">
      <head>
        <meta name="google-site-verification" content="vQe3HrEPuyNqaWOhMQ3YLVtLpg6pGwkLZvtIaaE99vc" />
        <meta name="google-site-verification" content="X1t-3bOz44QjPw2gznrdLPBeTqZPErySlFsT3H_Gx9U" />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: gtagBootstrap }} />
      </head>
      <body className={`${geistSans.variable} ${newsreader.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <CartProvider>
          <SiteHeader />
          <main className="min-h-[70vh]">{children}</main>
          <SiteFooter />
          <CookieConsent />
          <GoogleConsentSync />
        </CartProvider>
      </body>
    </html>
  );
}
