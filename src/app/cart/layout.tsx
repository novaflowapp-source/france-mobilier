import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
  alternates: { canonical: canonicalUrl("/cart") },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
