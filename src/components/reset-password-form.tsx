"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "@/components/password-input";

function ResetPasswordFields() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const invalid = searchParams.get("error") === "INVALID_TOKEN";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (result.error) {
        const raw = `${result.error.code || ""} ${result.error.message || ""}`.toLowerCase();
        if (raw.includes("invalid_token") || raw.includes("expired")) {
          throw new Error("This link is no longer valid. Request a new one.");
        }
        throw new Error(result.error.message || "Could not reset password.");
      }
      router.push("/login?reset=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setLoading(false);
    }
  }

  if (invalid || !token) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Invalid link</h1>
        <p className="text-sm leading-relaxed text-muted">
          This link expired or is no longer valid. Request a new one from the forgot password page.
        </p>
        <Link href="/forgot-password" className="btn btn-primary inline-flex w-full">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      <h1 className="text-2xl font-semibold tracking-tight">New password</h1>
      <p className="text-sm leading-relaxed text-muted">
        Choose a password of at least 8 characters. You can sign in afterward.
      </p>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">New password</span>
        <PasswordInput
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Confirm password</span>
        <PasswordInput
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md min-h-48" />}>
      <ResetPasswordFields />
    </Suspense>
  );
}
