import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { store } from "@/config/store";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("/connexion", {
  title: "Connexion",
  description: `Connectez-vous à votre compte ${store.storeName}.`,
});

export default function ConnexionPage() {
  return (
    <div className="container-page py-14">
      <AuthForm mode="login" />
    </div>
  );
}
