"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AUTH_CHANGED_EVENT,
  getCurrentUser,
  logoutUser,
} from "@/lib/authStorage";
import { PublicUser } from "@/interfaces/auth.interface";

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

  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
    setMenuOpen(false);
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#DADDE1] bg-white/95 shadow-[0_1px_0_rgba(24,119,242,0.06)] backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 text-[#1C1E21] sm:px-6 sm:py-4">
        <Link
          href="/landing"
          className="flex min-w-0 items-center gap-2 sm:gap-3"
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
            <span className="block truncate text-xs text-[#65676B]">
              Dreams Time
            </span>
          </div>
        </Link>

        <ul className="hidden items-center gap-5 text-sm font-medium lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                className="text-[#1C1E21] transition hover:text-[#1877F2]"
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {currentUser ? (
            <>
              <span
                className="max-w-[min(14rem,28vw)] truncate text-sm font-semibold text-[#1C1E21]"
                title={currentUser.fullName}
              >
                {currentUser.fullName}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="cursor-pointer shrink-0 rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 px-4 py-2 text-xs font-semibold text-[#1877F2] transition hover:bg-[#1877F2]/15"
              >
                Cerrar sesion
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 px-4 py-2 text-xs font-semibold text-[#1877F2] transition hover:bg-[#1877F2]/15"
            >
              Mi cuenta
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
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
          <ul className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block rounded-xl px-3 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-[#E7F3FF] text-[#1877F2]"
                        : "text-[#1C1E21] hover:bg-[#F0F2F5]"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="mt-2 border-t border-[#DADDE1] pt-3">
              {currentUser ? (
                <div className="flex flex-col gap-2 px-1">
                  <p
                    className="truncate px-2 text-sm font-semibold text-[#1C1E21]"
                    title={currentUser.fullName}
                  >
                    {currentUser.fullName}
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full cursor-pointer rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 px-4 py-3 text-sm font-semibold text-[#1877F2] transition hover:bg-[#1877F2]/15"
                  >
                    Cerrar sesion
                  </button>
                </div>
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
