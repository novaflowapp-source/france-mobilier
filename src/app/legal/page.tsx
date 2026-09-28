import type { Metadata } from "next";
import { formatPublicAddress, getBusinessIdentity } from "@/lib/business/identity";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/legal", {
  title: "Legal notice",
});

export default function LegalPage() {
  const identity = getBusinessIdentity();
  const address = formatPublicAddress(identity);

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Legal notice</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
        <p>{identity.relationship}</p>
        <p>
          The website {identity.storeName} ({identity.domain}) is published by {identity.legalName},{" "}
          {identity.legalForm}.
        </p>
        <p>Publication director: {identity.legalName}.</p>
        {address ? <p>Registered office: {address}.</p> : null}
        <p>Registration: {identity.registration}.</p>
        {identity.naf ? <p>Business activity (French NAF): {identity.naf}.</p> : null}
        {identity.vatNumber ? <p>VAT: {identity.vatNumber}</p> : null}
        <p>Contact: {identity.email}</p>
        {identity.phone ? <p>Phone: {identity.phone}</p> : null}
        <p>
          {identity.storeName} is not a U.S. corporation. The seller is established in France. Sales
          to customers in the United States are distance sales from that French business.
        </p>
        <p>Hosting: Railway, Netherlands / EU (cloud infrastructure).</p>
      </div>
    </div>
  );
}
