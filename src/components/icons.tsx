type IconProps = { className?: string };

const base = "h-5 w-5 shrink-0";

export function IconTruck({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M3 7h11v10H3V7Z" strokeWidth="1.6" />
      <path d="M14 10h4l3 3v4h-7V10Z" strokeWidth="1.6" />
      <circle cx="7" cy="18" r="1.6" strokeWidth="1.6" />
      <circle cx="18" cy="18" r="1.6" strokeWidth="1.6" />
    </svg>
  );
}

export function IconReturn({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M8 8H4V4" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 8a8 8 0 1 1-1.2 6" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconLock({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="1.5" strokeWidth="1.6" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeWidth="1.6" />
    </svg>
  );
}

export function IconTick({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="8.5" strokeWidth="1.6" />
      <path d="M8.5 12.2 11 14.7 15.5 9.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCheck({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M6.5 12.5 10.2 16 17.5 8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconHeadset({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M5 13a7 7 0 0 1 14 0" strokeWidth="1.6" />
      <rect x="3.5" y="12.5" width="3.8" height="6.2" rx="1.6" strokeWidth="1.6" />
      <rect x="16.7" y="12.5" width="3.8" height="6.2" rx="1.6" strokeWidth="1.6" />
      <path d="M19 18.2V19a2.4 2.4 0 0 1-2.4 2.4H12" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconPin({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.2" strokeWidth="1.6" />
    </svg>
  );
}

export function IconTag({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M12 4H5v7l9.5 9.5 7-7L12 4Z" strokeWidth="1.6" />
      <circle cx="8.2" cy="8.2" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconArrow({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSearch({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <circle cx="11" cy="11" r="6.2" strokeWidth="1.6" />
      <path d="m16 16 4 4" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconUser({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="3.2" strokeWidth="1.6" />
      <path d="M5 19.2a7 7 0 0 1 14 0" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconCopy({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <rect x="8" y="8" width="12" height="12" rx="1.5" strokeWidth="1.6" />
      <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" strokeWidth="1.6" />
    </svg>
  );
}

export function IconCookie({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12.1 3.15c.35 0 .62.27.7.6a3.15 3.15 0 0 0 3.75 2.35c.36-.08.74.12.84.48a3.2 3.2 0 0 0 2.72 2.42c.37.07.6.42.52.78A9 9 0 1 1 12.1 3.15Z"
      />
      <circle cx="9.1" cy="10.4" r="1.15" fill="#fff" />
      <circle cx="13.5" cy="13.15" r="1" fill="#fff" />
      <circle cx="8.7" cy="15.55" r="0.85" fill="#fff" />
      <circle cx="15.55" cy="16.85" r="0.95" fill="#fff" />
    </svg>
  );
}

export function IconBag({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M6 8h12l-1 12H7L6 8Z" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" strokeWidth="1.6" />
    </svg>
  );
}

export function IconEye({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M3 12s3.6-6.5 9-6.5S21 12 21 12s-3.6 6.5-9 6.5S3 12 3 12Z" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.4" strokeWidth="1.6" />
    </svg>
  );
}

export function IconRuler({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M4 8.5h16v7H4v-7Z" strokeWidth="1.6" />
      <path d="M8 8.5v3M12 8.5v4M16 8.5v3" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconSofa({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M4 14.5V11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3.5" strokeWidth="1.6" />
      <path d="M3 14.5h18v4H3v-4Z" strokeWidth="1.6" />
      <path d="M7 9V7.5A1.5 1.5 0 0 1 8.5 6h7A1.5 1.5 0 0 1 17 7.5V9" strokeWidth="1.6" />
    </svg>
  );
}

export function IconEyeOff({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M3 12s3.6-6.5 9-6.5c2 0 3.7.6 5.1 1.4" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M21 12s-1.2 2.2-3.2 3.9" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.1 10.2a2.4 2.4 0 0 0 3.7 3.1" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 4l16 16" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconSort({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="currentColor" />
      <g fill="none" stroke="#fff" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16.4" cy="14.6" r="2.7" />
        <path d="M16.4 18.4v9.2" />
        <path d="M16.4 27.6 14.6 36" />
        <path d="M16.4 21.4 26 17.4" />
        <path d="M29.2 21.2h10.2l-1.5 13.4H30.7L29.2 21.2Z" />
        <path d="M28 19.2h12.8" />
      </g>
    </svg>
  );
}

export function IconCamera({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M8.2 7.2 9.4 5.4h5.2l1.2 1.8H19a1.6 1.6 0 0 1 1.6 1.6v9.2A1.6 1.6 0 0 1 19 19.6H5a1.6 1.6 0 0 1-1.6-1.6V8.8A1.6 1.6 0 0 1 5 7.2h3.2Z" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13.2" r="3.1" strokeWidth="1.6" />
    </svg>
  );
}
