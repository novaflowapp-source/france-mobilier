"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await authClient.requestPasswordReset({
        email: email.trim().toLowerCase(),
        redirectTo: "/reset-password",
      });
      if (result.error) {
        const raw = `${result.error.code || ""} ${result.error.message || ""}`.toLowerCase();
        if (raw.includes("invalid origin")) {
          throw new Error("Could not send from this address. Try again from the website.");
        }
        throw new Error(result.error.message || "Could not send right now.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
      {sent ? (
        <p className="text-sm leading-relaxed text-muted">
          If an account exists for this address, we sent a reset link. The link expires in one hour.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-sm leading-relaxed text-muted">
            Enter your account email. We’ll send a link to choose a new password.
          </p>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Account email</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-accent underline-offset-2 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
