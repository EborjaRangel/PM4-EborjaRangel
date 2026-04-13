"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  AUTH_CHANGED_EVENT,
  getCurrentUser,
  logoutUser,
} from "@/lib/authStorage";
import { PublicUser } from "@/interfaces/auth.interface";

function Navbar() {
  // Siempre null en el primer render (SSR + hidratación): localStorage no existe en el servidor.
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    const sync = () => setCurrentUser(getCurrentUser());
    sync();
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, sync);
  }, []);

  const navLinks = [
    { href: "/landing", label: "Landing" },
    { href: "/home", label: "Shop" },
    { href: "/cart", label: "Carrito" },
    ...(currentUser?.role === "admin"
      ? [{ href: "/admin/products", label: "Admin productos" }]
      : []),
    ...(currentUser
      ? [
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
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#DADDE1] bg-white/95 shadow-[0_1px_0_rgba(24,119,242,0.06)] backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-[#1C1E21] sm:px-6">
        <Link href="/landing" className="flex items-center gap-3">
          <Image
            src="/brand/dreams-time-mark.png"
            alt="PULSE logo"
            width={42}
            height={42}
            className="h-10 w-10 rounded-full border border-[#1877F2]/35 object-cover shadow-sm"
            priority
          />
          <div className="leading-tight">
            <span className="block text-base font-bold tracking-wide text-[#1877F2]">
              PULSE
            </span>
            <span className="block text-xs text-[#65676B]">Dreams Time</span>
          </div>
        </Link>

        <ul className="flex items-center gap-5 text-sm font-medium">
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

        {currentUser ? (
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 px-4 py-2 text-xs font-semibold text-[#1877F2] transition hover:bg-[#1877F2]/15"
          >
            Cerrar sesion
          </button>
        ) : (
          <Link
            href="/login"
            className="rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 px-4 py-2 text-xs font-semibold text-[#1877F2] transition hover:bg-[#1877F2]/15"
          >
            Mi cuenta
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
