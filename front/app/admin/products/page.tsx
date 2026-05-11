"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";
import {
  BUILT_IN_ADMIN_EMAIL,
  BUILT_IN_ADMIN_PASSWORD,
  getCurrentUser,
} from "@/lib/authStorage";

export default function AdminProductsHubPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <PageShell>
        <p className="text-sm text-[#65676B]">Comprobando acceso…</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className={`${PULSE.card} p-6 sm:p-10`}>
        <p className={PULSE.kicker}>ADMINISTRACIÓN</p>
        <h1 className={`mt-2 ${PULSE.h1}`}>Admin productos</h1>
        <p className={`mt-2 max-w-2xl ${PULSE.body}`}>
          Elige si quieres dar de alta, editar o eliminar productos; también puedes administrar las
          categorías del catálogo.
        </p>

        <div
          className="mt-6 rounded-2xl border border-[#1877F2]/20 bg-[#E7F3FF]/50 px-4 py-3 text-sm text-[#1C1E21]"
          role="note"
        >
          <strong className="font-semibold">Cuenta administrador (PostgreSQL seed):</strong>{" "}
          {BUILT_IN_ADMIN_EMAIL} / {BUILT_IN_ADMIN_PASSWORD}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products/alta"
            className={`${PULSE.cardTight} border-[#1877F2]/20 p-6 transition hover:border-[#1877F2]/40 hover:shadow-[0_8px_32px_rgba(24,119,242,0.12)]`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#1877F2]">
              Alta
            </p>
            <h2 className={`mt-2 ${PULSE.h2}`}>Alta de productos</h2>
            <p className={`mt-2 text-sm ${PULSE.body}`}>
              Formulario para cargar nombre, precio, stock, categoría e imágenes (
              <code className="rounded bg-[#F0F2F5] px-1 py-0.5 text-[11px]">POST /products</code>
              ).
            </p>
            <span className={`mt-4 inline-block ${PULSE.link}`}>Ir al formulario →</span>
          </Link>

          <Link
            href="/admin/products/editar"
            className={`${PULSE.cardTight} border-[#1877F2]/20 p-6 transition hover:border-[#1877F2]/40 hover:shadow-[0_8px_32px_rgba(24,119,242,0.12)]`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#1877F2]">
              Edición
            </p>
            <h2 className={`mt-2 ${PULSE.h2}`}>Editar productos</h2>
            <p className={`mt-2 text-sm ${PULSE.body}`}>
              Modificar datos e imágenes de un producto existente (
              <code className="rounded bg-[#F0F2F5] px-1 py-0.5 text-[11px]">POST /products + pulseUpdateId</code>
              ).
            </p>
            <span className={`mt-4 inline-block ${PULSE.link}`}>Ir a edición →</span>
          </Link>

          <Link
            href="/admin/products/baja"
            className={`${PULSE.cardTight} border-[#1877F2]/20 p-6 transition hover:border-[#1877F2]/40 hover:shadow-[0_8px_32px_rgba(24,119,242,0.12)]`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#166FE5]">
              Baja
            </p>
            <h2 className={`mt-2 ${PULSE.h2}`}>Baja de productos</h2>
            <p className={`mt-2 text-sm ${PULSE.body}`}>
              Listado del catálogo para eliminar productos (
              <code className="rounded bg-[#F0F2F5] px-1 py-0.5 text-[11px]">DELETE /products/:id</code>
              ).
            </p>
            <span className={`mt-4 inline-block ${PULSE.link}`}>Ir a bajas →</span>
          </Link>

          <Link
            href="/admin/products/categorias"
            className={`${PULSE.cardTight} border-[#1877F2]/20 p-6 transition hover:border-[#1877F2]/40 hover:shadow-[0_8px_32px_rgba(24,119,242,0.12)] sm:col-span-2 lg:col-span-1`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#1877F2]">
              Categorías
            </p>
            <h2 className={`mt-2 ${PULSE.h2}`}>Administrar categorías</h2>
            <p className={`mt-2 text-sm ${PULSE.body}`}>
              Crear, editar y eliminar categorías para usarlas en alta/edición de productos (
              <code className="rounded bg-[#F0F2F5] px-1 py-0.5 text-[11px]">/categories</code>).
            </p>
            <span className={`mt-4 inline-block ${PULSE.link}`}>Ir a categorías →</span>
          </Link>
        </div>

        <p className="mt-10 text-sm text-[#65676B]">
          <Link href="/home" className={PULSE.link}>
            Ver tienda
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
