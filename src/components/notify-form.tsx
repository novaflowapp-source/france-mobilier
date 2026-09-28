"use client";

import { useId, useState } from "react";

export function NotifyForm({
  productName,
  productSlug,
  comingSoon = false,
}: {
  productName: string;
  productSlug: string;
  comingSoon?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const fieldId = useId();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productSlug }),
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="space-y-3 rounded-2xl border border-border bg-card p-5" onSubmit={onSubmit}>
      <p className="text-sm font-medium leading-relaxed">
        {comingSoon
          ? `Coming soon. Email me when ${productName} is available.`
          : `Out of stock. Email me when ${productName} is back in stock.`}
      </p>
      {status === "ok" ? (
        <p className="text-sm text-accent">You’re on the list.</p>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor={fieldId}>
            Email
          </label>
          <input
            id={fieldId}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input"
          />
          <button type="submit" className="btn btn-primary w-full whitespace-nowrap sm:w-auto" disabled={status === "loading"}>
            {status === "loading" ? "Sending…" : "Notify me"}
          </button>
        </div>
      )}
      {status === "error" && (
        <p className="text-sm text-red-700">Could not save your request. Please try again.</p>
      )}
    </form>
  );
}
