"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { navigationGroups, secondaryNavigation, store } from "@/config/store";
import { useCart } from "@/components/cart-provider";
import { IconBag, IconHeadset, IconReturn, IconSearch, IconTruck, IconUser } from "@/components/icons";
import { authClient } from "@/lib/auth-client";
import { WELCOME_PROMO } from "@/lib/promo";
import { WelcomeCodeMark, WelcomeRemaining } from "@/components/welcome-offer-note";
import { useProApproved } from "@/lib/use-pro-approved";

const SHRINK_AFTER = 80;
const EXPAND_BEFORE = 16;

function HeaderTopNotices({
  welcome,
  showCountdown = false,
}: {
  welcome: { status: "idle" | "active" | "expired"; remainingMs: number };
  showCountdown?: boolean;
}) {
  return (
    <>
      <Link href="/livraison" className="inline-flex shrink-0 items-center gap-1.5 hover:text-white">
        <IconTruck className="h-3.5 w-3.5" aria-hidden />
        Livraison gratuite
      </Link>
      <span className="text-white/40" aria-hidden>
        •
      </span>
      <Link
        href={WELCOME_PROMO.checkoutHref}
        className="inline-flex shrink-0 items-center gap-1.5 hover:opacity-80"
      >
        <WelcomeCodeMark onDark />
        {showCountdown && welcome.status === "active" ? (
          <>
            <span className="text-white/40">·</span>
            <WelcomeRemaining remainingMs={welcome.remainingMs} />
          </>
        ) : null}
      </Link>
      <span className="text-white/40" aria-hidden>
        •
      </span>
      <Link href="/retours" className="inline-flex shrink-0 items-center gap-1.5 hover:text-white">
        <IconReturn className="h-3.5 w-3.5" aria-hidden />
        Retours 14 jours
      </Link>
    </>
  );
}

export function SiteHeader() {
  const { itemCount, welcome } = useCart();
  const { data: session } = authClient.useSession();
  const proApproved = useProApproved();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setCompact((isCompact) => (isCompact ? y > EXPAND_BEFORE : y >= SHRINK_AFTER));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updatePanelTop = () => {
      const header = headerRef.current;
      if (header) setPanelTop(Math.round(header.getBoundingClientRect().bottom));
    };
    updatePanelTop();
    window.addEventListener("resize", updatePanelTop);
    return () => window.removeEventListener("resize", updatePanelTop);
  }, [compact, open]);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const { overflow: htmlOverflow } = html.style;
    const { overflow: bodyOverflow } = document.body.style;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const onTouchMove = (event: TouchEvent) => {
      const panel = document.querySelector(".mobile-nav-panel");
      if (panel && event.target instanceof Node && panel.contains(event.target)) return;
      event.preventDefault();
    };
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      html.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, [open]);

  function onSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") || "").trim();
    setOpen(false);
    router.push(q ? `/recherche?q=${encodeURIComponent(q)}` : "/recherche");
  }

  return (
    <>
      <div className="h-[calc(6.125rem+env(safe-area-inset-top))] md:h-[calc(7.25rem+env(safe-area-inset-top))]" aria-hidden />
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-40 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-md"
      >
        <p className="border-b border-border bg-navy text-[11px] tracking-[0.04em] text-white/90 md:text-xs">
          <span className="site-header-ticker md:hidden">
            <span className="site-header-ticker-track">
              <span className="site-header-ticker-set">
                <HeaderTopNotices welcome={welcome} />
                <span className="text-white/40" aria-hidden>
                  •
                </span>
              </span>
              <span className="site-header-ticker-set" aria-hidden inert>
                <HeaderTopNotices welcome={welcome} />
                <span className="text-white/40">•</span>
              </span>
            </span>
          </span>
          <span className="container-page hidden h-8 items-center justify-center gap-x-3 overflow-hidden whitespace-nowrap md:flex">
            <HeaderTopNotices welcome={welcome} showCountdown />
            <span className="text-white/40">•</span>
            <Link href="/contact" className="inline-flex items-center gap-1.5 hover:text-white">
              <IconHeadset className="h-3.5 w-3.5" aria-hidden />
              SAV du lundi au vendredi, 10h–22h
            </Link>
          </span>
        </p>
        <div
          className={`border-b border-border/80 transition-shadow duration-300 ${
            compact ? "shadow-[var(--shadow)]" : ""
          }`}
        >
          <div
            className={`container-page flex items-center justify-between gap-4 ${
              compact ? "min-h-14 py-2" : "min-h-16 py-2.5 md:min-h-[4.25rem]"
            }`}
          >
            <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
              <Image
                src={store.logoPath}
                alt={store.storeName}
                width={220}
                height={163}
                className={`max-w-36 object-contain transition-[height] duration-300 ${
                  compact ? "h-9 md:h-10" : "h-11 md:h-12"
                }`}
                priority
              />
            </Link>
            <nav className="hidden items-center gap-5 text-[14px] text-navy xl:flex xl:gap-6 xl:text-[15px]">
              {navigationGroups.map((item) =>
                "children" in item && item.children?.length ? (
                  <div key={item.href} className="group relative">
                    <Link
                      href={item.href}
                      className="relative inline-flex items-center whitespace-nowrap py-3 hover:opacity-70"
                    >
                      {item.label}
                    </Link>
                    <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-1 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      <div className="rounded-xl border border-border bg-white p-2 shadow-[var(--shadow)]">
                        <Link
                          href={item.href}
                          className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-cream"
                        >
                          Toute la sélection
                        </Link>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-cream hover:text-navy"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative whitespace-nowrap py-3 hover:opacity-70"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
            <form onSubmit={onSearch} className="hidden max-w-xs flex-1 md:block">
              <label className="sr-only" htmlFor="header-search">
                Rechercher
              </label>
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="header-search"
                  name="q"
                  type="search"
                  placeholder="Rechercher un produit…"
                  className="input input-with-icon"
                />
              </div>
            </form>
            <div className="flex items-center gap-1">
              <Link
                href={session?.user ? (proApproved ? "/compte" : "/compte/entreprise") : "/professionnels"}
                className="hidden h-11 items-center px-2 text-sm font-medium text-navy hover:opacity-70 sm:inline-flex"
              >
                {session?.user && proApproved ? "Espace Pro" : "Accès pro"}
              </Link>
              <Link
                href={session?.user ? "/compte" : "/connexion"}
                className="inline-flex h-11 w-11 items-center justify-center text-navy hover:opacity-70"
                aria-label={session?.user ? "Compte" : "Connexion"}
              >
                <IconUser />
              </Link>
              <Link
                href="/panier"
                className="relative inline-flex h-11 w-11 items-center justify-center text-navy hover:opacity-70"
                aria-label={itemCount > 0 ? `Panier, ${itemCount} articles` : "Panier"}
              >
                <IconBag />
                {itemCount > 0 ? (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-red)] px-1 text-[10px] font-semibold text-white">
                    {itemCount}
                  </span>
                ) : null}
              </Link>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center text-navy xl:hidden"
                aria-expanded={open}
                aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
                onClick={() => setOpen((value) => !value)}
              >
                <span aria-hidden className="flex flex-col gap-1.5">
                  <span className={`h-0.5 w-4 bg-navy transition ${open ? "translate-y-2 rotate-45" : ""}`} />
                  <span className={`h-0.5 w-4 bg-navy transition ${open ? "opacity-0" : ""}`} />
                  <span className={`h-0.5 w-4 bg-navy transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      {open ? (
        <div
          className="mobile-nav-panel fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white xl:hidden"
          style={{ top: panelTop || "6.125rem" }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="container-page space-y-4 py-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <form onSubmit={onSearch}>
              <label className="sr-only" htmlFor="mobile-search">
                Rechercher
              </label>
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="mobile-search"
                  name="q"
                  type="search"
                  placeholder="Rechercher un produit…"
                  className="input input-with-icon"
                />
              </div>
            </form>
            <nav className="grid gap-1 text-navy">
              {navigationGroups.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-3 hover:bg-cream"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {"children" in item && item.children?.length ? (
                    <div className="mb-1 ml-3 border-l border-border pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-cream hover:text-navy"
                          onClick={() => setOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              <p className="px-3 pt-3 text-xs uppercase tracking-[0.12em] text-muted">Plus</p>
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-3 hover:bg-cream"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={session?.user ? "/compte" : "/connexion"}
                className="rounded-lg px-3 py-3 hover:bg-cream sm:hidden"
                onClick={() => setOpen(false)}
              >
                {session?.user ? "Compte" : "Connexion"}
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
