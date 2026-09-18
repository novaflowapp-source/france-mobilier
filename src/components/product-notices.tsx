import { IconCamera, IconSort } from "@/components/icons";

const COLLECTION_POINTS_URL =
  "https://ecomaison.com/acceder-a-nos-points-de-collecte-pres-de-chez-vous/";

export function ProductNotices() {
  return (
    <section className="border-t border-border">
      <div className="container-page py-10 md:py-12">
        <ul className="prose-narrow space-y-6">
          <li className="flex gap-3.5 sm:gap-4">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center text-navy">
              <IconSort className="h-10 w-10" />
            </span>
            <p className="text-sm leading-relaxed text-muted">
              Ce produit peut, au choix, être réemployé ou recyclé. Si vous souhaitez le recycler, vous
              pouvez vous rendre dans l’un des points de collecte dont la liste est disponible sur{" "}
              <a
                href={COLLECTION_POINTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-navy underline decoration-navy/40 underline-offset-[0.18em]"
              >
                Maison du tri
              </a>
              .
            </p>
          </li>
          <li className="flex gap-3.5 sm:gap-4">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-start justify-center pt-0.5 text-navy">
              <IconCamera className="h-6 w-6" />
            </span>
            <p className="text-sm leading-relaxed text-muted">
              Les équipes France Mobilier mettent tout en œuvre pour restituer l’aspect des produits à
              travers des visuels au plus près de la réalité. Toutefois, la prise de vue, la luminosité et
              la résolution des écrans peuvent entraîner de légères variations dans la perception des
              couleurs, des dimensions ou des matières.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
