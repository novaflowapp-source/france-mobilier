import type { Metadata } from "next";
import Link from "next/link";
import { AdminProfessionals } from "@/components/admin-professionals";
import { getAdminSession } from "@/lib/admin";
import { listProAccessForAdmin } from "@/lib/pro-access";

export const metadata: Metadata = {
  title: "Professionals",
  robots: { index: false, follow: false },
};

export default async function AdminProfessionnelsPage() {
  const admin = await getAdminSession();
  if (!admin) {
    return (
      <div className="container-page py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Professionals</h1>
        <p className="mt-3 text-muted">
          <Link href="/login?next=/admin/professionals" className="underline">
            Admin sign in
          </Link>
        </p>
      </div>
    );
  }
  const rows = await listProAccessForAdmin("all");
  return (
    <div className="container-page space-y-8 py-10 md:py-14">
      <div>
        <p className="text-sm">
          <Link href="/admin" className="text-muted hover:underline">
            Admin
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Professionals</h1>
      </div>
      <AdminProfessionals
        initial={rows.map((row) => ({
          ...row,
          createdAt: row.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
