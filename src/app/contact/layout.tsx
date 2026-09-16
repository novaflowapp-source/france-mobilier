import type { Metadata } from "next";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/contact", {
  title: "Contact",
  description: "Contacter France Mobilier.",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
