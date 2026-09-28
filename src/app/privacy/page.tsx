import type { Metadata } from "next";
import { store } from "@/config/store";
import { CookieManageButton } from "@/components/cookie-manage-button";
import { indexableMetadata } from "@/lib/seo";

export const metadata: Metadata = indexableMetadata("/privacy", { title: "Privacy" });

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy policy</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
        <p>
          {store.storeName} is operated by DPSP, a business established in Lyon, France. We process
          personal information needed to run this store, including sales to customers in the United
          States.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>contact: name, email, message;</li>
          <li>customer account: name, email, hashed password;</li>
          <li>password reset: email with a one-hour link;</li>
          <li>
            trade access: French company identifiers (SIREN / SIRET) from the official Sirene
            directory, linked to the account — we do not collect a copy of an ID document;
          </li>
          <li>orders: name, email, phone, shipping address, and purchase history;</li>
          <li>card payments: processed by our payment provider (Stripe);</li>
          <li>technical hosting logs.</li>
        </ul>
        <p>
          We use this information to fulfill orders, provide customer service, meet legal
          obligations, and operate the site. Under the EU GDPR (we are established in France) you
          may request access, correction, or deletion at {store.supportEmail}. California residents
          may also request to know, delete, or correct personal information, and to opt out of any
          “sale” or “sharing” of personal information as those terms are defined by California law.
          We do not sell personal information for money. If you allow non-essential advertising
          cookies, campaign measurement may be considered “sharing” for advertising; you can refuse
          those cookies.
        </p>
        <h2 id="cookies" className="scroll-mt-28 pt-4 text-xl font-semibold tracking-tight text-navy">
          Cookies
        </h2>
        <p>Cookies and local storage are used to run the store:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>account and login session;</li>
          <li>cart (saved in the browser);</li>
          <li>access to a paid order;</li>
          <li>payment, processed on Stripe’s page under Stripe’s policy.</li>
        </ul>
        <p>
          If you accept non-essential cookies, the Google Ads tag (AW-17892406919) measures
          campaigns and completed purchases. Without consent, the tag stays in place but advertising
          cookies remain denied. You can change your choice at any time.
        </p>
        <p>
          <CookieManageButton className="btn btn-secondary">Change my choices</CookieManageButton>
        </p>
      </div>
    </div>
  );
}
