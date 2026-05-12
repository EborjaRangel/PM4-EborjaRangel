"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

function Footer() {
  const pathname = usePathname() ?? "";

  /** Sin fila de enlaces (Landing, Shop, etc.) en estas rutas. */
  const hideFooterQuickLinks =
    pathname === "/landing" ||
    pathname === "/home" ||
    pathname.startsWith("/product/") ||
    pathname === "/cart" ||
    pathname.startsWith("/admin/products") ||
    pathname === "/mis-compras" ||
    pathname === "/profile" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/envio/") ||
    pathname === "/login" ||
    pathname === "/register";

  return (
    <footer className="mt-auto border-t border-[#DADDE1] bg-[#F0F2F5] px-6 py-10 text-[#65676B]">
      <div
        className={`mx-auto flex w-full max-w-6xl flex-col items-center gap-6 text-sm ${
          hideFooterQuickLinks ? "justify-center" : "justify-between sm:flex-row"
        }`}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/brand/dreams-time-mark.png"
            alt="PULSE logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border border-[#1877F2]/30 object-cover shadow-sm"
          />
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold text-[#1877F2]">PULSE</span>.
            <span className="ml-1 text-[#65676B]">Dreams Time.</span> Todos los
            derechos reservados.
          </p>
        </div>
        {!hideFooterQuickLinks ? (
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/landing" className="transition hover:text-[#1877F2]">
              Landing
            </Link>
            <Link href="/home" className="transition hover:text-[#1877F2]">
              Shop
            </Link>
            <Link href="/cart" className="transition hover:text-[#1877F2]">
              Carrito
            </Link>
            <Link href="/mis-compras" className="transition hover:text-[#1877F2]">
              Mis compras
            </Link>
            <Link href="/checkout" className="transition hover:text-[#1877F2]">
              Pago
            </Link>
            <Link href="/login" className="transition hover:text-[#1877F2]">
              Login
            </Link>
            <Link href="/register" className="transition hover:text-[#1877F2]">
              Registro
            </Link>
          </div>
        ) : null}
      </div>
    </footer>
  );
}

export default Footer;
