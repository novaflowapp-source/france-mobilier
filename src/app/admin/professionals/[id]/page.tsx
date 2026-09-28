import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminProfessionalDetail } from "@/components/admin-professional-detail";
import { getAdminSession } from "@/lib/admin";
import { activityLabel, volumeLabel } from "@/lib/b2b";
import { listQuotesForUser } from "@/lib/quotes";
import { getProAccessById, listProAccessForAdmin } from "@/lib/pro-access";

export const metadata: Metadata = {
  title: "Professional record",
  robots: { index: false, follow: false },
};

export default async function AdminProfessionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getAdminSession();
  if (!admin) {
    return (
      <div className="container-page py-14">
        <Link href="/login?next=/admin/professionals" className="underline">
          Admin sign in
        </Link>
      </div>
    );
  }
  const { id } = await params;
  const row = await getProAccessById(id);
  if (!row) notFound();
  const listed = await listProAccessForAdmin("all");
  const withStats = listed.find((item) => item.id === id);
  const quotes = await listQuotesForUser(row.userId);

  return (
    <div className="container-page space-y-8 py-10 md:py-14">
      <p className="text-sm">
        <Link href="/admin/professionals" className="text-muted hover:underline">
          Professionals
        </Link>
      </p>
      <AdminProfessionalDetail
        request={{
          ...row,
          email: withStats?.email || "",
          orderCount: withStats?.orderCount ?? 0,
          orderTotalCents: withStats?.orderTotalCents ?? 0,
          activityLabel: activityLabel(row.activity),
          volumeLabel: volumeLabel(row.expectedOrderVolume),
          createdAt: row.createdAt.toISOString(),
          approvedAt: row.approvedAt?.toISOString() ?? null,
        }}
        quotes={quotes.map((quote) => ({
          id: quote.id,
          reference: quote.reference,
          status: quote.status,
          amountCents: quote.amountCents,
          createdAt: quote.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
