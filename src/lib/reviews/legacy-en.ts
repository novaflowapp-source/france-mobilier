/**
 * One-shot French → English copy for existing customer reviews.
 * Applied on DB migrate by review id (approved + pending).
 */
export const LEGACY_REVIEW_EN: Record<
  string,
  { title: string | null; body: string }
> = {
  "4e0ac71b-ef23-44d5-bb4e-b6fdb5bc7163": {
    title: null,
    body: "I love it — even better in person than in the photos.",
  },
  "9e17c725-b1eb-4985-9121-744828582e26": {
    title: null,
    body: "I ordered two, one on each side of the bed, and I love them!",
  },
  "eacfead3-7c13-4ef5-9ed6-d22b7424239b": {
    title: "Such a stylish look!",
    body: "Really pretty and good quality; I recommend it.",
  },
  "0171c3cd-49e3-4a0d-a53c-ba835fe9217b": {
    title: null,
    body: "Beautiful coffee table — sturdy and modern.",
  },
  "e7d5d5bb-623e-4077-b84d-d9471bea100e": {
    title: "Great",
    body: "Lovely piece, I recommend it :) It dresses the entry perfectly.",
  },
  "c4511fd3-5d1e-4725-bc17-917cf85ad7ad": {
    title: null,
    body: 'So nice! I was looking for a shoe cabinet that didn\'t look too "plastic," and I\'m thrilled.',
  },
  "0a762a9b-0b19-48c1-bb8e-87fc5c5b8adf": {
    title: "All good",
    body: "Nice furniture, nice finishes.\nI recommend it.",
  },
  "4ee5e581-29ba-4210-aa6b-6c22d95b83f4": {
    title: null,
    body: "Beautiful vanity — my daughter won't leave it alone.",
  },
  "5e068f7a-e330-4676-acea-ed77f8f963bf": {
    title: "Great",
    body: "Really good.",
  },
  "5b54973b-e79c-43e7-9117-6aabdf304a1f": {
    title: "The kids love it",
    body: "Such a cute vanity — the little ones adore it!",
  },
  "e6c8d436-9867-45d2-8bb3-36c2f5bba82c": {
    title: "Nice",
    body: "I like it — nice finishes.",
  },
  "b60a3a20-ff84-4061-a8ef-7ea3f38a6949": {
    title: "As described",
    body: "Matches the description and very modular — I recommend it.",
  },
  // Local / pending
  "6aa0f1c2-1223-44f4-801b-52c4a9435c6e": {
    title: null,
    body: "Really nice nightstand — compact size and a drawer that's handy every day.",
  },
};

/** Fallback when id is unknown but body still matches known French copy. */
export const LEGACY_REVIEW_BODY_EN: Record<string, string> = {
  "j'adore, plus beau en vrai qu'en photo":
    "I love it — even better in person than in the photos.",
  "J'en ai commandé deux, de chaque côté du lit et j'adore !":
    "I ordered two, one on each side of the bed, and I love them!",
  "Super jolie et de bonne qualité; je recommande.":
    "Really pretty and good quality; I recommend it.",
  "Très belle table basse, produit solide & moderne":
    "Beautiful coffee table — sturdy and modern.",
  "Très bel article, je recommande :) habille parfaitement l'entrée":
    "Lovely piece, I recommend it :) It dresses the entry perfectly.",
  'Très beau ! Je cherchais justement un meuble à chaussures qui ne fasse pas trop "plastique" et je suis ravie':
    'So nice! I was looking for a shoe cabinet that didn\'t look too "plastic," and I\'m thrilled.',
  "Beau meuble, belles finition.\nJE Recommande.": "Nice furniture, nice finishes.\nI recommend it.",
  "Très belle coiffeuse, ma fille ne la lâche plus":
    "Beautiful vanity — my daughter won't leave it alone.",
  "très bien.": "Really good.",
  "Coiffeuse très mignonne les petites adorent !":
    "Such a cute vanity — the little ones adore it!",
  "J'aime bien, belles finitions": "I like it — nice finishes.",
  "Produit conforme et modulable à souhait, je recommande.":
    "Matches the description and very modular — I recommend it.",
  "Très joli chevet, format compact et tiroir pratique au quotidien.":
    "Really nice nightstand — compact size and a drawer that's handy every day.",
};

export const LEGACY_REVIEW_TITLE_EN: Record<string, string> = {
  "Très design !": "Such a stylish look!",
  Super: "Great",
  super: "Great",
  "R.A.S": "All good",
  "Les enfants adorent": "The kids love it",
  Bien: "Nice",
  "Produit conforme": "As described",
};
