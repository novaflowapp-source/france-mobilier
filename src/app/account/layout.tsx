import type { Metadata } from "next";
import { AccountChrome } from "@/components/account-chrome";
import { getActivityAdminSession } from "@/lib/admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const admin = await getActivityAdminSession();
  return <AccountChrome isAdmin={Boolean(admin)}>{children}</AccountChrome>;
}
