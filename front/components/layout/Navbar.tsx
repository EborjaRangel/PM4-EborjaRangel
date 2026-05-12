"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  AUTH_CHANGED_EVENT,
  getCurrentUser,
  logoutUser,
} from "@/lib/authStorage";
import type { PublicUser } from "@/interfaces/auth.interface";

type NavGlyph =
  | "landing"
  | "shop"
  | "cart"
  | "admin"
  | "mis-compras"
  | "profile"
  | "dashboard"
  | "login"
  | "register";

function SvgFrame({
  children,
  size = "md",
}: {
  children: ReactNode;
  /** md: 16px, lg: navbar desktop, compact: badge chico */
  size?: "compact" | "md" | "lg";
}) {
  const map = {
    compact: "h-[13px] w-[13px] shrink-0",
    md: "h-4 w-4 shrink-0",
    lg: "h-[18px] w-[18px] shrink-0",
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={map[size]}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const GLYPH_SVGS: Record<NavGlyph, ReactNode> = {
  landing: (
    <>
      <circle cx="12" cy="12" r="3.5" strokeWidth="1.75" />
      <path d="M12 3v3M12 18v3M4.5 12h3m9 0h3M7 7l2.25 2.25M17 17l2.25 2.25M17 7L14.77 9.23M9.23 14.77L7 17" opacity="1" strokeWidth="1.25" />
    </>
  ),
  shop: (
    <>
      <path d="M3 10l9-5 9 5v10a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2V10z" strokeWidth="1.65" />
      <path d="M10 21V12h4v9" strokeWidth="1.65" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="21" r="2" strokeWidth="1.85" />
      <circle cx="18" cy="21" r="2" strokeWidth="1.85" />
      <path d="M2 6h5l3 13h13l3-13H13" strokeWidth="1.75" />
    </>
  ),
  admin: (
    <>
      <circle cx="12" cy="12" r="3" strokeWidth="1.85" />
      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.49 8.49l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.49-8.49l2.83-2.83" strokeWidth="1.45" />
    </>
  ),
  "mis-compras": (
    <>
      <path d="M6 21a2 2 0 0 1-2-2v-8h16v8a2 2 0 0 1-2 2H6z" strokeWidth="1.65" />
      <path d="M9 11V9a3 3 0 016 0v2" strokeWidth="1.65" />
      <path d="M10 17h8" opacity="0.88" strokeWidth="1.45" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="9" r="4" strokeWidth="1.75" />
      <path d="M5 21v-.8a7 7 0 0 1 14 0v.8" strokeWidth="1.75" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.35" strokeWidth="1.65" />
      <rect x="14" y="3" width="7" height="4.5" rx="1.35" strokeWidth="1.65" />
      <rect x="14" y="10.5" width="7" height="10.5" rx="1.35" strokeWidth="1.65" />
      <rect x="3" y="13.5" width="7" height="7.5" rx="1.35" strokeWidth="1.65" />
    </>
  ),
  login: (
    <>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeWidth="1.75" />
      <path d="M12 17l5-5-5-5" strokeWidth="1.75" />
      <path d="M21 12H9.5" strokeWidth="1.75" />
    </>
  ),
  register: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeWidth="1.75" />
      <circle cx="9" cy="7" r="4" strokeWidth="1.75" />
      <path d="M20 11v6M23 14h-6" strokeWidth="1.75" />
    </>
  ),
};

function navGlyphForHref(href: string): NavGlyph {
  switch (href) {
    case "/landing":
      return "landing";
    case "/home":
      return "shop";
    case "/cart":
      return "cart";
    case "/admin/products":
      return "admin";
    case "/mis-compras":
      return "mis-compras";
    case "/profile":
      return "profile";
    case "/dashboard":
      return "dashboard";
    case "/login":
      return "login";
    case "/register":
      return "register";
    default:
      return "shop";
  }
}

/** Chip del menú: rectángulo redondeado (desktop) / píldora (móvil), ícono + nombre más legibles. */
function NavRoundSection({
  href,
  label,
  active,
  layout,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  layout: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const glyph = navGlyphForHref(href);

  const base =
    "border text-center outline-none transition focus-visible:ring-2 focus-visible:ring-[#1877F2]/50 focus-visible:ring-offset-2";

  const activeCls =
    "border-[#0d66d9] bg-[#1877F2] shadow-[0_8px_20px_rgba(24,119,242,0.35)] ring-1 ring-[#1877F2]/38";

  const inactiveCls =
    "border-[#B8D4EF] bg-[#EAF5FF] hover:border-[#1877F2]/42 hover:bg-[#DDEBFA] hover:shadow-[0_5px_14px_rgba(24,119,242,0.1)]";

  if (layout === "desktop") {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`${base} ${active ? activeCls : inactiveCls} flex min-w-[4.75rem] max-w-[6.875rem] shrink-0 flex-col items-center gap-2 rounded-2xl px-3 py-2`}
      >
        <span className={`shrink-0 leading-none ${active ? "text-white" : "text-[#1877F2]"}`}>
          <SvgFrame size="lg">{GLYPH_SVGS[glyph]}</SvgFrame>
        </span>
        <span
          className={`hyphens-none break-words text-center text-sm font-semibold leading-snug tracking-tight text-balance line-clamp-2 ${
            active ? "text-white" : "text-[#1C1E21]"
          }`}
        >
          {label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`${base} ${active ? activeCls : inactiveCls} flex min-h-[3rem] w-full flex-row items-center gap-3 rounded-full px-3.5 py-2.5 text-left`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
          active ? "border-white/45 bg-white/15" : "border-[#9BC3EB]/95 bg-[#DCEEFB]/92"
        }`}
      >
        <span className={`leading-none ${active ? "text-white" : "text-[#1877F2]"}`}>
          <SvgFrame size="md">{GLYPH_SVGS[glyph]}</SvgFrame>
        </span>
      </span>
      <span
        className={`min-w-0 flex-1 text-pretty break-words text-sm font-semibold leading-snug ${
          active ? "text-white" : "text-[#1C1E21]"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

function Navbar() {
  // Siempre null en el primer render (SSR + hidratación): localStorage no existe en el servidor.
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const sync = () => setCurrentUser(getCurrentUser());
    sync();
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, sync);
  }, []);

  // Cierra el menu al cambiar de ruta o al pasar a desktop.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const navLinks = [
    { href: "/landing", label: "Landing" },
    { href: "/home", label: "Shop" },
    { href: "/cart", label: "Carrito" },
    ...(currentUser?.role === "admin"
      ? [{ href: "/admin/products", label: "Admin productos" }]
      : []),
    ...(currentUser
      ? [
          { href: "/mis-compras", label: "Mis compras" },
          { href: "/profile", label: "Perfil" },
          { href: "/dashboard", label: "Dashboard" },
        ]
      : [
          { href: "/login", label: "Login" },
          { href: "/register", label: "Registro" },
        ]),
  ];

  function navLinkIsActive(href: string) {
    if (pathname === href) return true;
    if (href === "/admin/products" && pathname.startsWith("/admin/products")) {
      return true;
    }
    return false;
  }

  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
    setMenuOpen(false);
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#DADDE1] bg-white/95 shadow-[0_1px_0_rgba(24,119,242,0.06)] backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 text-[#1C1E21] sm:gap-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Link
            href="/landing"
            className="flex shrink-0 items-center gap-2 sm:gap-3"
          >
            <Image
              src="/brand/dreams-time-mark.png"
              alt="PULSE logo"
              width={42}
              height={42}
              className="h-9 w-9 shrink-0 rounded-full border border-[#1877F2]/35 object-cover shadow-sm sm:h-10 sm:w-10"
              priority
            />
            <div className="min-w-0 leading-tight">
              <span className="block truncate text-base font-bold tracking-wide text-[#1877F2]">
                PULSE
              </span>
            <span
              className={`block truncate text-xs ${
                pathname === "/landing"
                  ? "landing-dreams-time-marquee font-medium"
                  : "text-[#65676B]"
              }`}
            >
              Dreams Time
            </span>
            </div>
          </Link>
          {currentUser ? (
            currentUser.role === "admin" ? (
              <span
                className="flex min-w-0 shrink flex-col leading-tight self-center"
                title={currentUser.fullName}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1877F2] sm:text-xs">
                  ADMIN
                </span>
                <span className="-mt-px text-xs font-bold uppercase tracking-wide text-[#1877F2] sm:text-sm">
                  PULSE
                </span>
              </span>
            ) : (
              <span
                className="min-w-0 truncate text-sm font-semibold text-[#1C1E21] sm:text-base"
                title={currentUser.fullName}
              >
                {currentUser.fullName}
              </span>
            )
          ) : null}
        </div>

        <div className="hidden lg:flex shrink-0 items-center gap-3 xl:gap-4">
          <ul className="flex items-start gap-3 xl:gap-4">
            {navLinks.map((link) => {
              const active = navLinkIsActive(link.href);
              return (
                <li key={link.href} className="shrink-0">
                  <NavRoundSection
                    href={link.href}
                    label={link.label}
                    active={active}
                    layout="desktop"
                  />
                </li>
              );
            })}
          </ul>
          {currentUser ? (
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer shrink-0 rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 px-4 py-2 text-xs font-semibold text-[#1877F2] transition hover:bg-[#1877F2]/15"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              href="/login"
              className="shrink-0 rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 px-4 py-2 text-xs font-semibold text-[#1877F2] transition hover:bg-[#1877F2]/15"
            >
              Mi cuenta
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#1877F2]/30 bg-white text-[#1877F2] transition hover:bg-[#E7F3FF] lg:hidden"
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-[#DADDE1] bg-white shadow-[0_8px_24px_rgba(24,119,242,0.08)] lg:hidden"
        >
          <ul className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 sm:px-6">
            {navLinks.map((link) => {
              const active = navLinkIsActive(link.href);
              return (
                <li key={link.href}>
                  <NavRoundSection
                    href={link.href}
                    label={link.label}
                    active={active}
                    layout="mobile"
                    onNavigate={() => setMenuOpen(false)}
                  />
                </li>
              );
            })}
            <li className="mt-2 border-t border-[#DADDE1] pt-3">
              {currentUser ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full cursor-pointer rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 px-4 py-3 text-sm font-semibold text-[#1877F2] transition hover:bg-[#1877F2]/15"
                >
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 px-4 py-3 text-center text-sm font-semibold text-[#1877F2] transition hover:bg-[#1877F2]/15"
                >
                  Mi cuenta
                </Link>
              )}
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
