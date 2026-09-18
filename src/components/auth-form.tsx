"use client";

import { FormEvent, Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "@/components/password-input";

const EMAIL_DOMAINS = [
  "gmail.com",
  "orange.fr",
  "hotmail.fr",
  "outlook.fr",
  "yahoo.fr",
  "free.fr",
  "sfr.fr",
  "icloud.com",
] as const;

type Mode = "login" | "register";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/compte";
  return value;
}

function authErrorMessage(
  error: { code?: string | null; message?: string | null },
  mode: Mode,
) {
  const raw = `${error.code || ""} ${error.message || ""}`.toLowerCase();
  if (raw.includes("already_exists") || raw.includes("already exists")) {
    return "Un compte existe déjà avec cet e-mail. Connectez-vous avec le même mot de passe.";
  }
  if (raw.includes("invalid_email_or_password") || raw.includes("invalid email or password")) {
    return "E-mail ou mot de passe incorrect.";
  }
  if (raw.includes("password_too_short") || raw.includes("too short")) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  return error.message || (mode === "login" ? "Identifiants incorrects" : "Inscription impossible");
}

function AuthFormFields({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const nextQuery = next !== "/compte" ? `?next=${encodeURIComponent(next)}` : "";
  const resetDone = searchParams.get("reset") === "1";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  function applyEmailDomain(domain: string) {
    const local = email.split("@")[0].trim();
    const next = local ? `${local}@${domain}` : `@${domain}`;
    setEmail(next);
    requestAnimationFrame(() => {
      const input = emailRef.current;
      if (!input) return;
      input.focus();
      const caret = local ? next.length : 0;
      input.setSelectionRange(caret, caret);
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        const result = await authClient.signUp.email({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim() || email.split("@")[0],
        });
        if (result.error) throw new Error(authErrorMessage(result.error, "register"));
      } else {
        const result = await authClient.signIn.email({
          email: email.trim().toLowerCase(),
          password,
        });
        if (result.error) throw new Error(authErrorMessage(result.error, "login"));
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === "login" ? "Connexion" : "Créer un compte"}
      </h1>
      <p className="text-sm text-muted">
        Les avis produits sont réservés aux clients avec un achat vérifié. Identifiant : votre
        e-mail.
      </p>
      {mode === "login" && resetDone ? (
        <p className="rounded-xl bg-cream px-4 py-3 text-sm leading-relaxed text-navy">
          Mot de passe mis à jour. Connectez-vous avec le nouveau mot de passe.
        </p>
      ) : null}
      {mode === "register" && (
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Nom Prénom</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="input"
          />
        </label>
      )}
      <label className="block text-sm">
        <span className="mb-1 block text-muted">E-mail</span>
        <input
          ref={emailRef}
          required
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
      </label>
      <div className="-mt-1 flex flex-wrap gap-2" role="group" aria-label="Domaines e-mail courants">
        {EMAIL_DOMAINS.map((domain) => {
          const selected = email.toLowerCase().endsWith(`@${domain}`);
          return (
            <button
              key={domain}
              type="button"
              onClick={() => applyEmailDomain(domain)}
              aria-pressed={selected}
              className={`min-h-10 rounded-full border px-3 py-1.5 text-sm ${
                selected
                  ? "border-navy bg-navy text-white"
                  : "border-navy/25 bg-cream text-navy"
              }`}
            >
              @{domain}
            </button>
          );
        })}
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Mot de passe</span>
        <PasswordInput
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {mode === "login" ? (
        <p className="text-sm">
          <Link href="/mot-de-passe-oublie" className="text-accent underline-offset-2 hover:underline">
            Mot de passe oublié ?
          </Link>
        </p>
      ) : null}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "Patientez…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
      </button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            Pas encore de compte ?{" "}
            <Link
              href={`/inscription${nextQuery}`}
              className="font-semibold text-navy underline underline-offset-2 decoration-navy/40 hover:decoration-navy"
            >
              S’inscrire
            </Link>
          </>
        ) : (
          <>
            Déjà inscrit ?{" "}
            <Link href={`/connexion${nextQuery}`} className="text-accent underline-offset-2 hover:underline">
              Se connecter
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md min-h-48" />}>
      <AuthFormFields mode={mode} />
    </Suspense>
  );
}
