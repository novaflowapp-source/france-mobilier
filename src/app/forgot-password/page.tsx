import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { store } from "@/config/store";

export const metadata: Metadata = {
  title: "Forgot password",
  description: `Reset the password for your ${store.storeName} account.`,
  robots: { index: false, follow: false },
};

export default function MotDePasseOubliePage() {
  return (
    <div className="container-page py-14">
      <ForgotPasswordForm />
    </div>
  );
}
