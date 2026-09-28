import type { Metadata } from "next";
import Link from "next/link";
import { AdminKeywordPlanner } from "@/components/admin-keyword-planner";
import { getAdminSession, listAdminEmails } from "@/lib/admin";
import { isKeywordPlannerConfigured, listMissingKeywordPlannerEnv } from "@/lib/keywords/google-ads";

export const metadata: Metadata = {
  title: "Keywords",
  robots: { index: false, follow: false },
};

export default async function AdminKeywordsPage() {
  const admin = await getAdminSession();
  const adminEmail = listAdminEmails()[0];

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Search volumes</h1>
      <p className="mt-2 text-sm text-muted">
        Google Ads Keyword Planner — internal view, not indexed.
      </p>

      {admin ? (
        <AdminKeywordPlanner
          configured={isKeywordPlannerConfigured()}
          missing={listMissingKeywordPlannerEnv()}
        />
      ) : (
        <section className="mt-8 rounded-2xl border border-border bg-white p-5">
          <p className="text-sm text-muted">
            Sign in with the admin account to run a search.
            {adminEmail ? (
              <>
                {" "}
                <Link href="/login?next=/admin/keywords" className="text-navy underline-offset-2 hover:underline">
                  Sign in
                </Link>
              </>
            ) : null}
          </p>
        </section>
      )}
    </div>
  );
}
