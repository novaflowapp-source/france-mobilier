"use client";

import { FormEvent, useState } from "react";
import { PasswordInput } from "@/components/password-input";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not change password.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="password" className="scroll-mt-28 border-t border-border pt-6">
      <h2 className="text-lg font-semibold tracking-tight">Password</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        If you checked out as a guest, replace your temporary password here.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Current password</span>
          <PasswordInput
            required
            autoComplete="current-password"
            minLength={8}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">New password</span>
          <PasswordInput
            required
            autoComplete="new-password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Confirm new password</span>
          <PasswordInput
            required
            autoComplete="new-password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {success ? (
          <p className="text-sm text-navy">Password updated.</p>
        ) : null}
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Please wait…" : "Save password"}
        </button>
      </form>
    </section>
  );
}
