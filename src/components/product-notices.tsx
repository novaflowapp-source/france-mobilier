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
              This product can be reused or recycled. To recycle it, find a drop-off location listed on{" "}
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
              Our team works to show products as accurately as possible in photos. Lighting, camera
              angles, and your screen can still cause slight differences in how colors, dimensions, or
              materials appear.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
