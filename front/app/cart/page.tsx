"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";
import { getCurrentUser } from "@/lib/authStorage";
import type { PublicUser } from "@/interfaces/auth.interface";
import { getMockCartTotals, mockCartItems } from "@/data/mockCart";

function CartPage() {
  const [clientUser, setClientUser] = useState<PublicUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setClientUser(getCurrentUser());
    setHydrated(true);
  }, []);

  const { subtotal, shipping, taxes, total } = getMockCartTotals();

  return (
    <PageShell>
      <section className={`mb-8 ${PULSE.card} p-8 sm:p-10`}>
        <p className={PULSE.kicker}>CHECKOUT PULSE</p>
        <h1 className={`mt-2 ${PULSE.h1}`}>Carrito de compras</h1>
        <p className={`mt-3 max-w-3xl ${PULSE.body}`}>
          Revisa tus productos, confirma cantidades y completa tu pedido con una
          experiencia segura y profesional.
        </p>
      </section>

      {hydrated && clientUser ? (
        <section className={`mb-6 ${PULSE.card} p-6 sm:p-8`}>
          <p className={PULSE.kicker}>DATOS DEL CLIENTE</p>
          <h2 className={`mt-2 ${PULSE.h2}`}>Facturación y contacto</h2>
          <p className={`mt-1 text-sm ${PULSE.body}`}>
            Usaremos estos datos para el envío y la confirmación del pedido.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className={PULSE.surfaceMuted}>
              <p className="text-xs text-[#65676B]">Nombre completo</p>
              <p className="mt-1 font-semibold text-[#1C1E21]">
                {clientUser.fullName}
              </p>
            </div>
            <div className={PULSE.surfaceMuted}>
              <p className="text-xs text-[#65676B]">Correo electrónico</p>
              <p className="mt-1 font-semibold text-[#1C1E21]">
                {clientUser.email}
              </p>
            </div>
            <div className={PULSE.surfaceMuted}>
              <p className="text-xs text-[#65676B]">Cliente desde</p>
              <p className="mt-1 font-semibold text-[#1C1E21]">
                {new Date(clientUser.createdAt).toLocaleDateString("es", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className={PULSE.surfaceMuted}>
              <p className="text-xs text-[#65676B]">Último acceso</p>
              <p className="mt-1 font-semibold text-[#1C1E21]">
                {new Date(clientUser.lastLoginAt).toLocaleString("es")}
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className={`mt-4 inline-block text-sm ${PULSE.link}`}
          >
            Editar datos en mi perfil →
          </Link>
        </section>
      ) : hydrated && !clientUser ? (
        <section
          className={`mb-6 rounded-2xl border border-[#1877F2]/20 bg-[#E7F3FF]/50 p-6 sm:p-8`}
        >
          <p className="text-sm font-semibold text-[#1C1E21]">
            Inicia sesión para asociar el pedido a tu cuenta
          </p>
          <p className={`mt-2 text-sm ${PULSE.body}`}>
            Así podremos mostrar tu nombre y correo en el checkout y guardar tu
            historial.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/login" className={PULSE.btnPrimary}>
              Iniciar sesión
            </Link>
            <Link href="/register" className={PULSE.btnSecondary}>
              Crear cuenta
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
        <article className={`${PULSE.card} p-5 sm:p-6`}>
          <div className="mb-4 flex items-center justify-between border-b border-[#1877F2]/10 pb-4">
            <h2 className={PULSE.h2}>Productos en tu carrito</h2>
            <span className="rounded-full bg-[#E7F3FF] px-3 py-1 text-xs font-semibold text-[#1877F2]">
              {mockCartItems.length} items
            </span>
          </div>

          <div className="space-y-4">
            {mockCartItems.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col gap-4 rounded-2xl border border-[#1877F2]/12 ${PULSE.surfaceMuted} p-4 sm:flex-row sm:items-center sm:justify-between`}
              >
                <div>
                  <p className="text-base font-semibold text-[#1C1E21]">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm text-[#65676B]">{item.category}</p>
                </div>
                <div className="flex items-center gap-6">
                  <p className="text-sm text-[#65676B]">Cant: {item.qty}</p>
                  <p className="text-base font-bold text-[#1877F2]">
                    ${(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className={`h-fit ${PULSE.card} p-6`}>
          <h2 className={PULSE.h2}>Resumen de compra</h2>
          {hydrated && clientUser ? (
            <p className="mt-3 text-xs text-[#65676B]">
              Pedido a nombre de{" "}
              <span className="font-semibold text-[#1C1E21]">
                {clientUser.fullName}
              </span>
            </p>
          ) : null}
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between text-[#65676B]">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[#65676B]">
              <span>Envio</span>
              <span>{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex items-center justify-between text-[#65676B]">
              <span>Impuestos</span>
              <span>${taxes.toFixed(2)}</span>
            </div>
            <div className="my-3 border-t border-[#1877F2]/10" />
            <div className="flex items-center justify-between text-base font-bold text-[#1C1E21]">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Link href="/checkout" className={`mt-6 block ${PULSE.btnPrimaryBlock} text-center`}>
            Proceder al pago
          </Link>
          <Link
            href="/home"
            className={`mt-3 block w-full ${PULSE.btnSecondary} py-3 text-center`}
          >
            Seguir comprando
          </Link>
        </aside>
      </section>
    </PageShell>
  );
}

export default CartPage;
