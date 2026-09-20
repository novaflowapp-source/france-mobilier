import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { store } from "@/config/store";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("/inscription", {
  title: "Créer un compte",
  description: `Créez votre compte ${store.storeName} pour suivre vos commandes et laisser des avis vérifiés.`,
});

export default function InscriptionPage() {
  return (
    <div className="container-page py-14">
      <AuthForm mode="register" />
    </div>
  );
}
