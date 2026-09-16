/**
 * Branding & store configuration — edit this file to rebrand.
 */

const PRODUCTION_SITE_URL = "https://francemobilier.org";

function isLocalHostUrl(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host.endsWith(".local");
  } catch {
    return true;
  }
}

function publicSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.BETTER_AUTH_URL?.trim();
  const value = (fromEnv || PRODUCTION_SITE_URL).replace(/\/$/, "");
  // Docker build sets BETTER_AUTH_URL=http://localhost:3000. That must not leak into
  // robots.txt / sitemap.xml or Google treats the catalog as unreachable.
  if (process.env.NODE_ENV === "production" && isLocalHostUrl(value)) {
    return PRODUCTION_SITE_URL;
  }
  return value;
}

export const store = {
  storeName: "France Mobilier",
  storeTagline:
    "Des meubles sélectionnés pour gagner en confort, en espace et en simplicité au quotidien.",
  tagline: "Des meubles sélectionnés pour gagner en confort, en espace et en simplicité au quotidien.",
  domain: publicSiteUrl(),
  supportEmail: process.env.SUPPORT_EMAIL?.trim() || "contact@francemobilier.org",
  /** Horaires affichés publiquement (bandeau, contact). */
  supportHoursShort: "lun–ven 10h–22h",
  supportHours: "Du lundi au vendredi, de 10h à 22h",
  country: "FR",
  currency: "EUR",
  locale: "fr-FR",
  logoPath: "/logo-france-mobilier.png",
  /** Raison sociale affichée : DPSP. */
  companyName: "DPSP",
  companyLegalForm: "Entrepreneur individuel",
  companyTradeName: "DPSP",
  companyAddress: "75B Rue Chazière",
  companyCity: "Lyon",
  companyPostalCode: "69004",
  companyCountry: "France",
  companySiren: "882 131 071",
  companySiret: "882 131 071 00038",
  companyRegistration: "SIREN 882 131 071 — SIRET 882 131 071 00038",
  companyNaf: "47.91B — Vente à distance sur catalogue spécialisé",
  vatNumber: "",
  phone: "",
  returnAddress: "",
  socials: {
    instagram: "",
    facebook: "",
    pinterest: "",
  },
} as const;

export const navigationGroups = [
  { href: "/nouveautes", label: "Nouveautés" },
  {
    href: "/collections/salon",
    label: "Salon",
    children: [
      { href: "/collections/tables-basses", label: "Tables basses" },
      { href: "/collections/meubles-tv", label: "Meubles TV" },
      { href: "/collections/tables-a-manger", label: "Tables à manger" },
      { href: "/collections/buffets", label: "Buffets" },
      { href: "/collections/consoles", label: "Consoles" },
    ],
  },
  {
    href: "/collections/chambre",
    label: "Chambre",
    children: [
      { href: "/collections/tables-de-chevet", label: "Tables de chevet" },
      { href: "/collections/coiffeuses", label: "Coiffeuses" },
      { href: "/collections/commodes", label: "Commodes" },
      { href: "/collections/armoires", label: "Armoires" },
    ],
  },
  {
    href: "/collections/entree-rangement",
    label: "Entrée & rangement",
    children: [
      { href: "/collections/meubles-chaussures", label: "Meubles à chaussures" },
      { href: "/collections/casiers", label: "Casiers" },
      { href: "/collections/consoles", label: "Consoles" },
    ],
  },
  {
    href: "/collections/bureau",
    label: "Bureau",
    children: [
      { href: "/collections/bureaux", label: "Bureaux" },
      { href: "/collections/caissons", label: "Caissons" },
    ],
  },
  { href: "/collections/petits-espaces", label: "Petits espaces" },
] as const;

export const navigation = navigationGroups.map(({ href, label }) => ({ href, label }));

export const secondaryNavigation = [
  { href: "/collections/meubles", label: "Tous les meubles" },
  { href: "/guides", label: "Conseils" },
  { href: "/collections/animaux", label: "Animaux" },
  { href: "/professionnels", label: "Professionnels" },
  { href: "/contact", label: "Contact" },
] as const;

export const collections = [
  {
    slug: "salon",
    name: "Salon",
    description: "Tables, meubles TV et pièces choisies pour un salon plus simple à vivre.",
    rooms: ["salon"] as const,
    image: "/lifestyle/maison.jpg",
  },
  {
    slug: "chambre",
    name: "Chambre",
    description: "Chevets, coiffeuses et petits meubles pour organiser la chambre.",
    rooms: ["chambre"] as const,
    image: "/lifestyle/marque.jpg",
  },
  {
    slug: "entree-rangement",
    name: "Entrée & rangement",
    description: "Des meubles pratiques pour organiser l’entrée et optimiser les espaces étroits.",
    rooms: ["entree"] as const,
    image: "/lifestyle/rangement.jpg",
  },
  {
    slug: "bureau",
    name: "Bureau",
    description: "Bureaux et rangements pour travailler chez soi avec aisance.",
    rooms: ["bureau"] as const,
    image: "/lifestyle/bureau.jpg",
  },
  {
    slug: "petits-espaces",
    name: "Petits espaces",
    description: "Des meubles sélectionnés pour gagner en confort et en espace.",
    smallSpace: true,
    image: "/lifestyle/petits-espaces.jpg",
  },
  {
    slug: "meubles",
    name: "Tous les meubles",
    description: "Le mobilier France Mobilier.",
    rooms: ["salon", "chambre", "entree", "bureau"] as const,
    secondary: true,
  },
  {
    slug: "tables-basses",
    name: "Tables basses",
    description: "Des tables basses compactes, choisies pour les salons où chaque centimètre compte.",
    productTypes: ["table-basse"] as const,
    secondary: true,
  },
  {
    slug: "meubles-tv",
    name: "Meubles TV",
    description: "Des meubles TV peu profonds pour rester le long du mur.",
    productTypes: ["meuble-tv"] as const,
    secondary: true,
  },
  {
    slug: "tables-a-manger",
    name: "Tables à manger",
    description: "Des tables à manger extensibles pour les pièces qui doivent rester souples.",
    productTypes: ["table-a-manger"] as const,
    secondary: true,
  },
  {
    slug: "tables-de-chevet",
    name: "Tables de chevet",
    description: "Des tables de chevet aux dimensions lisibles, pour les chambres compactes.",
    productTypes: ["table-de-chevet"] as const,
    secondary: true,
  },
  {
    slug: "coiffeuses",
    name: "Coiffeuses",
    description: "Des coiffeuses choisies pour leur format et leur usage quotidien.",
    productTypes: ["coiffeuse"] as const,
    secondary: true,
  },
  {
    slug: "meubles-chaussures",
    name: "Meubles à chaussures",
    description: "Des meubles à chaussures sélectionnés pour optimiser l’entrée, y compris les espaces étroits.",
    productTypes: ["meuble-chaussures"] as const,
    secondary: true,
  },
  {
    slug: "casiers",
    name: "Meubles à casiers",
    description: "Des casiers peu profonds pour ranger le long d’un mur.",
    productTypes: ["casiers"] as const,
    secondary: true,
  },
  {
    slug: "buffets",
    name: "Buffets",
    description: "Des buffets bas qui s’alignent le long du mur.",
    productTypes: ["buffet"] as const,
    secondary: true,
  },
  {
    slug: "consoles",
    name: "Consoles",
    description: "Des consoles peu profondes pour le salon ou l’entrée.",
    productTypes: ["console"] as const,
    secondary: true,
  },
  {
    slug: "commodes",
    name: "Commodes",
    description: "Des commodes pour une chambre plus rangée et plus sereine.",
    productTypes: ["commode"] as const,
    secondary: true,
  },
  {
    slug: "armoires",
    name: "Armoires",
    description: "Des armoires étroites pour les chambres d’appartement.",
    productTypes: ["armoire"] as const,
    secondary: true,
  },
  {
    slug: "bureaux",
    name: "Bureaux",
    description: "Des bureaux compacts pour travailler chez soi avec aisance.",
    productTypes: ["bureau"] as const,
    secondary: true,
  },
  {
    slug: "caissons",
    name: "Caissons",
    description: "Des caissons pour ranger à côté du bureau et libérer le plateau.",
    productTypes: ["caisson"] as const,
    secondary: true,
  },
  {
    slug: "accessoires",
    name: "Accessoires",
    description: "Des accessoires pour sublimer un meuble.",
    rooms: ["accessoires"] as const,
    secondary: true,
  },
  {
    slug: "animaux",
    name: "Animaux",
    description: "Du pratique, en harmonie avec votre intérieur.",
    categories: ["animaux"] as const,
    rooms: ["accessoires"] as const,
    secondary: true,
    image: "/lifestyle/animaux.jpg",
  },
  {
    slug: "maison",
    name: "Maison",
    description: "Salon et chambre : les meubles du quotidien.",
    rooms: ["salon", "chambre"] as const,
    secondary: true,
    image: "/lifestyle/maison.jpg",
  },
  {
    slug: "rangement",
    name: "Rangement",
    description: "Entrée et rangements pensés pour gagner de la place.",
    rooms: ["entree"] as const,
    secondary: true,
    image: "/lifestyle/rangement.jpg",
  },
] as const;
