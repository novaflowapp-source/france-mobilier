export type SirenLookup = {
  siren: string;
  legalName: string;
  status: "A" | "C" | string;
  active: boolean;
  city: string;
  activity: string;
  siret: string;
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/** Luhn, lu de droite à gauche (norme SIREN / SIRET). */
export function luhnOk(value: string) {
  const digits = digitsOnly(value);
  if (!digits.length) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

export function normalizeSiren(value: string) {
  return digitsOnly(value);
}

export function isValidSiren(value: string) {
  const siren = normalizeSiren(value);
  return siren.length === 9 && luhnOk(siren);
}

export function isValidSiret(value: string, siren?: string) {
  const siret = digitsOnly(value);
  if (siret.length !== 14 || !luhnOk(siret)) return false;
  if (siren && siret.slice(0, 9) !== normalizeSiren(siren)) return false;
  return true;
}

type ApiResult = {
  siren?: string;
  nom_complet?: string;
  nom_raison_sociale?: string;
  etat_administratif?: string;
  activite_principale?: string;
  siege?: {
    siret?: string;
    libelle_commune?: string;
    commune?: string;
  };
};

export async function lookupSiren(siren: string): Promise<SirenLookup | null> {
  const id = normalizeSiren(siren);
  if (!isValidSiren(id)) return null;

  const url = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(id)}&page=1&per_page=5`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "FranceMobilier/1.0 (contact@francemobilier.org)",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: ApiResult[] };
    const match = (data.results ?? []).find((row) => row.siren === id);
    if (!match) return null;
    const status = match.etat_administratif || "";
    return {
      siren: id,
      legalName: match.nom_complet || match.nom_raison_sociale || "",
      status,
      active: status === "A",
      city: match.siege?.libelle_commune || "",
      activity: match.activite_principale || "",
      siret: match.siege?.siret || "",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
