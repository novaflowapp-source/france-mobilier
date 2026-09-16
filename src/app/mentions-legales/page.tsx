import type { Metadata } from "next";
import { formatPublicAddress, getBusinessIdentity } from "@/lib/business/identity";

export const metadata: Metadata = {
  title: "Mentions légales",
};

export default function LegalPage() {
  const identity = getBusinessIdentity();
  const address = formatPublicAddress(identity);

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Mentions légales</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
        <p>{identity.relationship}</p>
        <p>
          Le site {identity.storeName} ({identity.domain}) est édité par {identity.legalName},{" "}
          {identity.legalForm}.
        </p>
        <p>Directeur de la publication : {identity.legalName}.</p>
        {address ? <p>Siège : {address}.</p> : null}
        <p>Immatriculation : {identity.registration}.</p>
        {identity.naf ? <p>Activité (NAF) : {identity.naf}.</p> : null}
        {identity.vatNumber ? <p>TVA : {identity.vatNumber}</p> : null}
        <p>Contact : {identity.email}</p>
        {identity.phone ? <p>Téléphone : {identity.phone}</p> : null}
        <p>Hébergement : Railway, Pays-Bas / UE (infrastructure cloud).</p>
      </div>
    </div>
  );
}
