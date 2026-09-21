import { IconCamera, IconSort } from "@/components/icons";

const COLLECTION_POINTS_URL =
  "https://ecomaison.com/acceder-a-nos-points-de-collecte-pres-de-chez-vous/";

export function ProductNotices() {
  return (
    <section className="product-notices">
      <div className="container-page py-16 md:py-24">
        <ul className="grid gap-12 md:grid-cols-2 md:gap-16 lg:gap-20">
          <li className="product-notices-item">
            <span className="product-notices-icon" aria-hidden>
              <IconSort className="h-14 w-14" />
            </span>
            <p>
              Ce produit peut, au choix, être réemployé ou recyclé. Si vous souhaitez le recycler, vous
              pouvez vous rendre dans l’un des points de collecte dont la liste est disponible sur{" "}
              <a
                href={COLLECTION_POINTS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Maison du tri
              </a>
              .
            </p>
          </li>
          <li className="product-notices-item">
            <span className="product-notices-icon product-notices-icon-outline" aria-hidden>
              <IconCamera className="h-8 w-8" />
            </span>
            <p>
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
