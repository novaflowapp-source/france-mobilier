import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { store } from "@/config/store";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("/login", {
  title: "Sign in",
  description: `Sign in to your ${store.storeName} account.`,
});

export default function ConnexionPage() {
  return (
    <div className="container-page py-14">
      <AuthForm mode="login" />
    </div>
  );
}
