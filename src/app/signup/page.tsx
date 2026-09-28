import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { store } from "@/config/store";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("/signup", {
  title: "Create account",
  description: `Create your ${store.storeName} account to track orders and leave verified reviews.`,
});

export default function InscriptionPage() {
  return (
    <div className="container-page py-14">
      <AuthForm mode="register" />
    </div>
  );
}
