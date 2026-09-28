"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      if (res.ok) {
        form.reset();
        setStatus("ok");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <label className="block text-sm">
        Name
        <input name="name" required autoComplete="name" className="input mt-1" />
      </label>
      <label className="block text-sm">
        Email
        <input name="email" type="email" required autoComplete="email" className="input mt-1" />
      </label>
      <label className="block text-sm">
        Message
        <textarea name="message" required minLength={10} rows={5} className="input mt-1" />
      </label>
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send"}
      </button>
      {status === "ok" ? (
        <p className="text-sm text-accent">Message received. We’ll reply as soon as we can.</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-700">Could not send right now. Please try again later.</p>
      ) : null}
    </form>
  );
}
