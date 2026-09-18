import Link from "next/link";
import { paymentMethods, paymentMethodHref, type PaymentMethodSlug } from "@/lib/payment-methods";

const badge =
  "footer-payment-mark inline-flex h-9 min-w-[2.75rem] items-center justify-center overflow-hidden rounded-[0.4rem] bg-white px-2.5";

function VisaMark() {
  return (
    <svg viewBox="0 0 48 16" className="h-[13px] w-[42px]" aria-hidden>
      <text
        x="24"
        y="13.2"
        textAnchor="middle"
        fill="#1A1F71"
        fontFamily="Arial, Helvetica, sans-serif"
        fontStyle="italic"
        fontWeight="800"
        fontSize="14.5"
        letterSpacing="-0.6"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardMark() {
  return (
    <svg viewBox="0 0 32 20" className="h-[18px] w-[29px]" aria-hidden>
      <circle cx="12" cy="10" r="8" fill="#EB001B" />
      <circle cx="20" cy="10" r="8" fill="#F79E1B" />
      <path d="M16 4.15a8 8 0 0 1 0 11.7 8 8 0 0 1 0-11.7Z" fill="#FF5F00" />
    </svg>
  );
}

function CartesBancairesMark() {
  return (
    <svg viewBox="0 0 32 20" className="h-[18px] w-[29px]" aria-hidden>
      <rect width="32" height="20" rx="3" fill="#0A2F6C" />
      <text
        x="16"
        y="14.2"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="11"
        letterSpacing="0.4"
      >
        CB
      </text>
    </svg>
  );
}

function ApplePayMark() {
  return (
    <svg viewBox="0 0 44 20" className="h-[14px] w-[36px]" aria-hidden>
      <path
        fill="#111"
        transform="translate(0.2 1.8) scale(0.68)"
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"
      />
      <text
        x="17"
        y="14.6"
        fill="#111"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="600"
        fontSize="11.5"
      >
        Pay
      </text>
    </svg>
  );
}

function GooglePayMark() {
  return (
    <svg viewBox="0 0 58 20" className="h-[15px] w-[46px]" aria-hidden>
      <g transform="translate(0 3.2) scale(0.56)">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC04"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </g>
      <text
        x="16.5"
        y="15.2"
        fill="#3C4043"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="500"
        fontSize="12.5"
      >
        Pay
      </text>
    </svg>
  );
}

const marks: { slug: PaymentMethodSlug; Mark: typeof VisaMark }[] = [
  { slug: "visa", Mark: VisaMark },
  { slug: "mastercard", Mark: MastercardMark },
  { slug: "cartes-bancaires", Mark: CartesBancairesMark },
  { slug: "apple-pay", Mark: ApplePayMark },
  { slug: "google-pay", Mark: GooglePayMark },
];

export function PaymentMarks() {
  return (
    <ul
      className="flex flex-wrap items-center gap-1.5"
      aria-label="Moyens de paiement : carte, Apple Pay et Google Pay"
    >
      {marks.map(({ slug, Mark }) => {
        const method = paymentMethods.find((item) => item.slug === slug);
        if (!method) return null;
        return (
          <li key={slug}>
            <Link
              href={paymentMethodHref(slug)}
              className={badge}
              title={`${method.name} — conditions de paiement`}
              aria-label={`${method.name} — voir les conditions de paiement`}
            >
              <Mark />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
