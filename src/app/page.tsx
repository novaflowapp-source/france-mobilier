import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { IconHeadset, IconRuler, IconSofa, IconTruck } from "@/components/icons";
import { store } from "@/config/store";
import { listFeaturedProducts, listSellableProducts } from "@/lib/products/repository";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

const rooms = [
  {
    slug: "salon",
    image: "/lifestyle/maison.jpg",
    title: "Salon",
    text: "Tables, meubles TV, pièces compactes.",
  },
  {
    slug: "chambre",
    image: "/lifestyle/marque.jpg",
    title: "Chambre",
    text: "Chevets et petits meubles utiles.",
  },
  {
    slug: "entree-rangement",
    image: "/lifestyle/rangement.jpg",
    title: "Entrée",
    text: "Rangements étroits et meubles à chaussures.",
  },
  {
    slug: "bureau",
    image: "/lifestyle/bureau.jpg",
    title: "Bureau",
    text: "Travailler chez soi, avec aisance.",
  },
] as const;

const guarantees = [
  {
    title: "Pensé pour les petits espaces",
    text: "Des meubles sélectionnés pour optimiser votre intérieur.",
    icon: IconSofa,
  },
  {
    title: "Dimensions détaillées",
    text: "Pour savoir immédiatement si le meuble convient à votre pièce.",
    icon: IconRuler,
  },
  {
    title: "Livraison suivie",
    text: "Un suivi clair, de l’expédition à la réception.",
    icon: IconTruck,
  },
  {
    title: "Service client",
    text: `SAV ${store.supportHoursShort}.`,
    icon: IconHeadset,
  },
];

export default function HomePage() {
  const featured = listFeaturedProducts(8);
  const selection = featured.slice(0, 8);
  const entryUniverse = listSellableProducts()
    .filter((product) => product.rooms?.includes("entree"))
    .slice(0, 4);

  return (
    <div>
      <section className="relative min-h-[70svh] overflow-hidden bg-navy text-white md:min-h-[84vh]">
        <Image
          src="/lifestyle/hero.jpg"
          alt="Intérieur contemporain avec mobilier clair et lumineux"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/40 to-navy/20 md:bg-gradient-to-r md:from-navy/80 md:via-navy/45 md:to-navy/15" />
        <div className="container-page relative flex min-h-[70svh] items-end py-12 md:min-h-[84vh] md:items-center md:py-24">
          <div className="max-w-xl pb-2">
            <p className="eyebrow text-white">
              <span className="text-white">Une sélection exigeante</span>
            </p>
            <h1 className="display mt-4 text-[1.85rem] text-white sm:text-4xl md:text-6xl">
              Le mobilier qui simplifie votre intérieur.
            </h1>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-white/85 md:mt-5 md:text-lg">
              Des meubles sélectionnés pour gagner en confort, en espace et en simplicité au
              quotidien.
            </p>
            <div className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap">
              <Link href="/collections/meubles" className="btn btn-inverse w-full sm:w-auto">
                Découvrir les meubles
              </Link>
              <Link href="/collections/petits-espaces" className="btn btn-on-dark w-full sm:w-auto">
                Voir les petits espaces
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="container-page grid grid-cols-2 gap-x-4 gap-y-5 py-7 md:grid-cols-4 md:gap-8 md:py-10">
          {guarantees.map((item) => (
            <div key={item.title} className="flex gap-2.5">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
              <div>
                <p className="text-sm font-semibold text-navy">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted md:text-sm">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <p className="eyebrow">Pièces</p>
          <h2 className="display mt-3 text-[1.75rem] text-navy md:text-4xl">Acheter par pièce</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((item) => (
              <Link
                key={item.slug}
                href={`/collections/${item.slug}`}
                className="group relative min-h-52 overflow-hidden rounded-[var(--radius)] sm:min-h-64"
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-navy/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 px-6 py-5 text-white">
                  <h3 className="display text-2xl">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/85">{item.text}</p>
                  <p className="mt-3 text-sm text-white/90">Voir la sélection →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container-page">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Sélection</p>
              <h2 className="display mt-3 text-3xl text-navy md:text-4xl">Les essentiels France Mobilier</h2>
              <p className="mt-3 max-w-xl text-muted">
                Une sélection courte de meubles, choisis pour leur usage et leurs dimensions.
              </p>
            </div>
            <Link href="/collections/meubles" className="btn btn-secondary w-full sm:w-auto">
              Tous les meubles
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {selection.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid items-center gap-10 md:grid-cols-2">
          <div className="md:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
              <Image
                src="/lifestyle/petits-espaces.jpg"
                alt="Intérieur compact, lumineux, avec du mobilier peu encombrant"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          <div>
            <p className="eyebrow">Petits espaces</p>
            <h2 className="display mt-3 text-3xl text-navy md:text-4xl">Petits espaces, grand confort.</h2>
            <p className="mt-5 leading-relaxed text-muted">
              Découvrez des meubles pensés pour les appartements, studios et pièces où chaque
              centimètre compte.
            </p>
            <Link href="/collections/petits-espaces" className="btn btn-primary mt-8 w-full sm:w-auto">
              Découvrir les petits espaces
            </Link>
          </div>
        </div>
      </section>

      {entryUniverse.length > 1 ? (
        <section className="section section-cream">
          <div className="container-page">
            <p className="eyebrow">Univers</p>
            <h2 className="display mt-3 text-3xl text-navy md:text-4xl">Pour l’entrée</h2>
            <p className="mt-3 max-w-xl text-muted">
              Des meubles qui se glissent dans un couloir et libèrent le passage.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {entryUniverse.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container-page grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="eyebrow">Conseils</p>
            <h2 className="display mt-3 text-3xl text-navy md:text-4xl">Mieux choisir, pièce par pièce</h2>
            <p className="mt-5 leading-relaxed text-muted">
              Des guides courts pour lire les dimensions, aménager un studio ou choisir un meuble
              d’entrée étroit.
            </p>
            <Link href="/guides" className="btn btn-secondary mt-8 w-full sm:w-auto">
              Conseils & inspiration
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
            <Image
              src="/lifestyle/rangement.jpg"
              alt="Rangements alignés le long d’un mur clair"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container-page grid items-center gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
            <Image
              src="/lifestyle/marque.jpg"
              alt="Détail de mobilier contemporain en bois clair"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="eyebrow">La marque</p>
            <h2 className="display mt-3 text-3xl text-navy md:text-4xl">Une sélection qui a du sens.</h2>
            <p className="mt-5 leading-relaxed text-muted">
              Chez {store.storeName}, chaque meuble apporte du confort, de l’ordre et de la clarté.
              Une sélection pensée pour les logements d’aujourd’hui — appartements, studios, bureaux
              à la maison.
            </p>
            <Link href="/a-propos" className="btn btn-primary mt-8 w-full sm:w-auto">
              Lire notre histoire
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-navy text-white">
        <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between md:py-16">
          <div className="max-w-2xl">
            <p className="eyebrow text-white">Professionnels</p>
            <h2 className="display mt-3 text-[1.85rem] text-white sm:text-4xl md:text-5xl">
              France Mobilier Pro
            </h2>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-white/85 md:text-lg">
              Vous aménagez des bureaux, logements ou espaces professionnels ? Demandez un devis
              pour vos commandes en volume.
            </p>
            <p className="mt-3 text-sm text-white/55">
              Des conditions adaptées peuvent être proposées selon les produits et volumes
              commandés.
            </p>
          </div>
          <Link href="/professionnels" className="btn btn-inverse w-full shrink-0 text-base sm:w-auto md:min-h-12 md:px-8">
            Découvrir l’espace Pro
          </Link>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container-page grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="display text-3xl text-navy">Livraison et retours</h2>
            <p className="mt-4 leading-relaxed text-muted">
              {SHIPPING_OFFERED_SENTENCE} Vous disposez de 14 jours pour vous rétracter après
              réception, lorsque le droit français le prévoit.
            </p>
            <div className="mt-5 flex gap-4 text-sm">
              <Link href="/livraison" className="text-navy underline-offset-4 hover:underline">
                Livraison
              </Link>
              <Link href="/retours" className="text-navy underline-offset-4 hover:underline">
                Retours
              </Link>
            </div>
          </div>
          <div>
            <h2 className="display text-3xl text-navy">Questions fréquentes</h2>
            <div className="mt-5 space-y-4">
              <div>
                <p className="font-medium text-navy">Où livrez-vous ?</p>
                <p className="mt-1 text-sm text-muted">
                  {SHIPPING_OFFERED_SENTENCE} Un suivi est communiqué après l’expédition.
                </p>
              </div>
              <div>
                <p className="font-medium text-navy">Les prix sont-ils TTC ?</p>
                <p className="mt-1 text-sm text-muted">Oui. Le total est confirmé au paiement.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
