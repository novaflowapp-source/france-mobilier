"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountOrders } from "@/components/account-orders";
import { ChangePasswordForm } from "@/components/change-password-form";
import { authClient } from "@/lib/auth-client";
import { useProApproved } from "@/lib/use-pro-approved";

function ProStatus() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pro-access")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.request) {
          setLabel("No Pro access yet. Add your company SIREN under Company — your email stays the same.");
          return;
        }
        if (data.request.status === "approved") setLabel("Professional access is active.");
        else if (data.request.status === "pending" || data.request.status === "eligible") {
          setLabel("Your professional application is under review.");
        } else if (data.request.status === "suspended") {
          setLabel("Your professional access is temporarily unavailable.");
        } else if (data.request.status === "rejected") {
          setLabel("Your application could not be approved. Contact us if you need help.");
        } else setLabel("Pro access request was not approved.");
      })
      .catch(() => {});
  }, []);

  if (!label) return null;
  return <p className="mt-4 text-sm leading-relaxed text-muted">{label}</p>;
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const proApproved = useProApproved();

  async function logout() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  if (isPending) {
    return <p className="text-muted">Loading account…</p>;
  }

  if (!session?.user) {
    return (
      <>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My account</h1>
          <p className="mt-2 max-w-xl text-muted">
            Sign in for Pro access and reviews. Paid orders can also be found without an account,
            using checkout email and shipping ZIP.
          </p>
        </div>
        <AccountOrders signedIn={false} />
      </>
    );
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My account</h1>
        {proApproved ? <p className="mt-1 text-sm text-navy">Professional account</p> : null}
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(20rem,26rem)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-white p-6">
          <p className="text-sm text-muted">Name</p>
          <p className="font-medium">{session.user.name}</p>
          <p className="mt-4 text-sm text-muted">Email</p>
          <p className="font-medium">{session.user.email}</p>
          <ChangePasswordForm />
        </div>
        <div className="min-w-0 space-y-6">
          <AccountOrders signedIn />
          <div className="rounded-2xl border border-border bg-white p-6">
            <p className="text-sm leading-relaxed text-muted">
              Product reviews are for verified purchases. After you submit one, it appears online only
              once approved.
            </p>
            <ProStatus />
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/account/company" className="btn btn-primary">
                {proApproved ? "My company" : "Professional account"}
              </Link>
              <button type="button" onClick={logout} className="btn btn-secondary">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
