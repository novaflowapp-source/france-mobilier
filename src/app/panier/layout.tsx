import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Panier",
  robots: { index: false, follow: false },
  alternates: { canonical: canonicalUrl("/panier") },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
