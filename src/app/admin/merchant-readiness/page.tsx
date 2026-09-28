import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/admin";
import { buildMerchantReadinessReport, type MerchantCheck } from "@/lib/merchant/readiness";

export const metadata: Metadata = {
  title: "Merchant readiness",
  robots: { index: false, follow: false },
};

function Level({ level }: { level: MerchantCheck["level"] }) {
  const color =
    level === "BLOCKER" ? "text-red-700" : level === "WARNING" ? "text-amber-700" : "text-emerald-700";
  return <span className={`font-medium ${color}`}>{level}</span>;
}

export default async function MerchantReadinessPage() {
  const admin = await getAdminSession();
  const report = buildMerchantReadinessReport();

  return (
    <div className="container-page py-10 md:py-14">
      <p className="text-sm text-muted">
        <Link href="/admin" className="underline-offset-4 hover:underline">
          Admin
        </Link>
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Merchant Center readiness</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Internal checks. “Merchant-ready” here does not guarantee Google approval.{" "}
        {admin ? "" : "Sign in for order detail; this report exposes no secrets."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Overall</p>
          <p className="mt-1 text-2xl font-semibold">{report.globalReady ? "Ready" : "Blocked"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Sellable products</p>
          <p className="mt-1 text-2xl font-semibold">{report.sellableCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Merchant-ready offers</p>
          <p className="mt-1 text-2xl font-semibold">{report.merchantReadyCount}</p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Site</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {report.global.map((item) => (
            <li key={item.id} className="rounded-xl border border-border bg-white p-4">
              <p>
                <Level level={item.level} /> · {item.label}
              </p>
              <p className="mt-1 text-muted">{item.detail}</p>
              <p className="mt-1 text-xs text-muted">{item.id}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Sellable products</h2>
        <div className="mt-4 space-y-6">
          {report.products
            .filter((row) => row.purchasable)
            .map((row) => (
              <article key={row.id} className="rounded-2xl border border-border bg-white p-5">
                <h3 className="font-medium text-navy">{row.name}</h3>
                <p className="text-sm text-muted">
                  {row.slug} · {row.offers} offer{row.offers > 1 ? "s" : ""} ·{" "}
                  {row.ready ? "MERCHANT READY" : "NOT MERCHANT READY"}
                </p>
                <ul className="mt-3 space-y-1 text-sm">
                  {row.checks.map((item) => (
                    <li key={item.id}>
                      <Level level={item.level} /> {item.label} — {item.detail}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}
