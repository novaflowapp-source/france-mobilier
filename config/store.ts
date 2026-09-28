/**
 * Branding & store configuration — edit this file to rebrand.
 */

const PRODUCTION_SITE_URL = "https://francemobilier.com";

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
  storeTagline: "Furniture chosen to make everyday rooms more comfortable, spacious, and simple.",
  tagline: "Furniture chosen to make everyday rooms more comfortable, spacious, and simple.",
  domain: publicSiteUrl(),
  supportEmail: process.env.SUPPORT_EMAIL?.trim() || "contact@francemobilier.com",
  /** Hours shown publicly (header, contact). Paris time — the business is based in France. */
  supportHoursShort: "Mon–Fri 10am–10pm Paris time",
  supportHours: "Monday–Friday, 10:00 a.m.–10:00 p.m. (Paris time)",
  country: "US",
  currency: "USD",
  locale: "en-US",
  logoPath: "/logo-france-mobilier.png",
  /** Raison sociale affichée : DPSP. */
  companyName: "DPSP",
  companyLegalForm: "Entrepreneur individuel (French sole proprietorship)",
  companyTradeName: "DPSP",
  companyAddress: "75B Rue Chazière",
  companyCity: "Lyon",
  companyPostalCode: "69004",
  companyCountry: "France",
  companySiren: "882 131 071",
  companySiret: "882 131 071 00038",
  companyRegistration: "SIREN 882 131 071 — SIRET 882 131 071 00038",
  companyNaf: "47.91B — Distance selling on specialized catalog",
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
  { href: "/new", label: "New" },
  {
    href: "/collections/salon",
    label: "Living room",
    children: [
      { href: "/collections/tables-basses", label: "Coffee tables" },
      { href: "/collections/meubles-tv", label: "TV stands" },
      { href: "/collections/tables-a-manger", label: "Dining tables" },
      { href: "/collections/buffets", label: "Sideboards" },
      { href: "/collections/consoles", label: "Consoles" },
    ],
  },
  {
    href: "/collections/chambre",
    label: "Bedroom",
    children: [
      { href: "/collections/tables-de-chevet", label: "Nightstands" },
      { href: "/collections/coiffeuses", label: "Vanities" },
      { href: "/collections/commodes", label: "Dressers" },
      { href: "/collections/armoires", label: "Wardrobes" },
    ],
  },
  {
    href: "/collections/entree-rangement",
    label: "Entry & storage",
    children: [
      { href: "/collections/meubles-chaussures", label: "Shoe storage" },
      { href: "/collections/casiers", label: "Cubbies" },
      { href: "/collections/consoles", label: "Consoles" },
    ],
  },
  {
    href: "/collections/bureau",
    label: "Office",
    children: [
      { href: "/collections/bureaux", label: "Desks" },
      { href: "/collections/caissons", label: "Pedestals" },
    ],
  },
  { href: "/collections/petits-espaces", label: "Small spaces" },
] as const;

export const navigation = navigationGroups.map(({ href, label }) => ({ href, label }));

export const secondaryNavigation = [
  { href: "/collections/meubles", label: "All furniture" },
  { href: "/guides", label: "Guides" },
  { href: "/collections/animaux", label: "Pets" },
  { href: "/trade", label: "Trade" },
  { href: "/contact", label: "Contact" },
] as const;

export const collections = [
  {
    slug: "salon",
    name: "Living room",
    description: "Tables, TV stands, and pieces chosen to make the living room easier to live in.",
    rooms: ["salon"] as const,
    image: "/lifestyle/maison.jpg",
  },
  {
    slug: "chambre",
    name: "Bedroom",
    description: "Nightstands, vanities, and compact pieces to organize the bedroom.",
    rooms: ["chambre"] as const,
    image: "/lifestyle/marque.jpg",
  },
  {
    slug: "entree-rangement",
    name: "Entry & storage",
    description: "Practical furniture for organizing the entryway and making the most of narrow spaces.",
    rooms: ["entree"] as const,
    image: "/lifestyle/rangement.jpg",
  },
  {
    slug: "bureau",
    name: "Office",
    description: "Desks and storage for working from home with ease.",
    rooms: ["bureau"] as const,
    image: "/lifestyle/bureau.jpg",
  },
  {
    slug: "petits-espaces",
    name: "Small spaces",
    description: "Furniture selected to add comfort without crowding the room.",
    smallSpace: true,
    image: "/lifestyle/petits-espaces.jpg",
  },
  {
    slug: "meubles",
    name: "All furniture",
    description: "The France Mobilier collection.",
    rooms: ["salon", "chambre", "entree", "bureau"] as const,
    secondary: true,
  },
  {
    slug: "tables-basses",
    name: "Coffee tables",
    description: "Compact coffee tables for living rooms where every inch counts.",
    productTypes: ["table-basse"] as const,
    secondary: true,
  },
  {
    slug: "meubles-tv",
    name: "TV stands",
    description: "Shallow TV stands that sit close to the wall.",
    productTypes: ["meuble-tv"] as const,
    secondary: true,
  },
  {
    slug: "tables-a-manger",
    name: "Dining tables",
    description: "Extendable dining tables for rooms that need to stay flexible.",
    productTypes: ["table-a-manger"] as const,
    secondary: true,
  },
  {
    slug: "tables-de-chevet",
    name: "Nightstands",
    description: "Nightstands with clear dimensions, for compact bedrooms.",
    productTypes: ["table-de-chevet"] as const,
    secondary: true,
  },
  {
    slug: "coiffeuses",
    name: "Vanities",
    description: "Vanities chosen for everyday use and a manageable footprint.",
    productTypes: ["coiffeuse"] as const,
    secondary: true,
  },
  {
    slug: "meubles-chaussures",
    name: "Shoe storage",
    description: "Shoe cabinets selected to organize the entry, including narrow halls.",
    productTypes: ["meuble-chaussures"] as const,
    secondary: true,
  },
  {
    slug: "casiers",
    name: "Cubbies",
    description: "Shallow cubby units that line up along a wall.",
    productTypes: ["casiers"] as const,
    secondary: true,
  },
  {
    slug: "buffets",
    name: "Sideboards",
    description: "Low sideboards that sit flush along the wall.",
    productTypes: ["buffet"] as const,
    secondary: true,
  },
  {
    slug: "consoles",
    name: "Consoles",
    description: "Shallow consoles for the living room or entry.",
    productTypes: ["console"] as const,
    secondary: true,
  },
  {
    slug: "commodes",
    name: "Dressers",
    description: "Dressers for a more organized, calmer bedroom.",
    productTypes: ["commode"] as const,
    secondary: true,
  },
  {
    slug: "armoires",
    name: "Wardrobes",
    description: "Narrow wardrobes for apartment bedrooms.",
    productTypes: ["armoire"] as const,
    secondary: true,
  },
  {
    slug: "bureaux",
    name: "Desks",
    description: "Compact desks for working from home with ease.",
    productTypes: ["bureau"] as const,
    secondary: true,
  },
  {
    slug: "caissons",
    name: "Pedestals",
    description: "Pedestal storage beside the desk so the work surface stays clear.",
    productTypes: ["caisson"] as const,
    secondary: true,
  },
  {
    slug: "accessoires",
    name: "Accessories",
    description: "Accessories to finish a piece of furniture.",
    rooms: ["accessoires"] as const,
    secondary: true,
  },
  {
    slug: "animaux",
    name: "Pets",
    description: "Practical pieces that sit comfortably in the home.",
    categories: ["animaux"] as const,
    rooms: ["accessoires"] as const,
    secondary: true,
    image: "/lifestyle/animaux.jpg",
  },
  {
    slug: "maison",
    name: "Home",
    description: "Living room and bedroom: everyday furniture.",
    rooms: ["salon", "chambre"] as const,
    secondary: true,
    image: "/lifestyle/maison.jpg",
  },
  {
    slug: "rangement",
    name: "Storage",
    description: "Entry and storage pieces designed to free up space.",
    rooms: ["entree"] as const,
    secondary: true,
    image: "/lifestyle/rangement.jpg",
  },
] as const;
