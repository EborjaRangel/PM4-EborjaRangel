"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";
import { AUTH_CHANGED_EVENT, getCurrentUser } from "@/lib/authStorage";
import type { PublicUser } from "@/interfaces/auth.interface";
import {
  CART_UPDATED_EVENT,
  ICartItem,
  ICartTotals,
  getCart,
  getCartTotals,
  removeFromCart,
  setQty,
} from "@/lib/cartStorage";
import { categoryLabel } from "@/data/productCategories";

function CartImage({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="h-16 w-16 rounded-lg border border-[#1877F2]/12 bg-[#E7F3FF]/50" />
    );
  }
  const allowedHost =
    src.includes("picsum.photos") ||
    src.includes("images.unsplash.com") ||
    src.includes("source.unsplash.com");

  if (allowedHost) {
    return (
      <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#1877F2]/12">
        <Image src={src} alt={alt} fill sizes="64px" className="object-cover" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-16 w-16 rounded-lg border border-[#1877F2]/12 object-cover"
    />
  );
}

function CartPage() {
  const [clientUser, setClientUser] = useState<PublicUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [items, setItems] = useState<ICartItem[]>([]);
  const [totals, setTotals] = useState<ICartTotals>({
    subtotal: 0,
    shipping: 0,
    taxes: 0,
    total: 0,
  });

  const sync = useCallback(() => {
    const list = getCart();
    setItems(list);
    setTotals(getCartTotals(list));
  }, []);

  useEffect(() => {
    function onAuth() {
      setClientUser(getCurrentUser());
      sync();
    }
    onAuth();
    setHydrated(true);
    window.addEventListener(CART_UPDATED_EVENT, sync);
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync);
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
    };
  }, [sync]);

  function handleInc(id: number, current: number) {
    setQty(id, current + 1);
  }

  function handleDec(id: number, current: number) {
    setQty(id, current - 1);
  }

  function handleRemove(id: number) {
    removeFromCart(id);
  }

  const empty = hydrated && items.length === 0;

  return (
    <PageShell compactTop>
      <section className={`mb-4 ${PULSE.card} px-6 py-3 sm:px-10 sm:py-4`}>
        <p className={PULSE.kicker}>CHECKOUT PULSE</p>
        <h1 className={`mt-1 ${PULSE.h1}`}>Carrito de compras</h1>
        <p className={`mt-1 max-w-3xl ${PULSE.body}`}>
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
            <div className={`${PULSE.surfaceMuted} sm:col-span-2`}>
              <p className="text-xs text-[#65676B]">
                Dirección de entrega y envío
              </p>
              <p className="mt-1 font-semibold text-[#1C1E21] whitespace-pre-wrap">
                {clientUser.address?.trim()
                  ? clientUser.address.trim()
                  : "Sin indicar. Complétala en tu perfil para el envío."}
              </p>
            </div>
            <div className={PULSE.surfaceMuted}>
              <p className="text-xs text-[#65676B]">Teléfono de contacto</p>
              <p className="mt-1 font-semibold text-[#1C1E21]">
                {clientUser.phone?.trim()
                  ? clientUser.phone.trim()
                  : "Sin indicar. Agrégalo en tu perfil."}
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
          className={`mb-4 rounded-2xl border border-[#1877F2]/20 bg-[#E7F3FF]/50 px-6 py-3 sm:px-8 sm:py-4`}
        >
          <p className="text-sm font-semibold text-[#1C1E21]">
            Inicia sesión para asociar el pedido a tu cuenta
          </p>
          <p className={`mt-1 text-sm ${PULSE.body}`}>
            Así podremos mostrar tu nombre y correo en el checkout y guardar tu
            historial.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/login" className={PULSE.btnPrimary}>
              Iniciar sesión
            </Link>
            <Link href="/register" className={PULSE.btnSecondary}>
              Crear cuenta
            </Link>
          </div>
        </section>
      ) : null}

      {empty ? (
        <section className={`${PULSE.card} p-6 text-center sm:p-12`}>
          <h2 className={PULSE.h2}>Tu carrito esta vacio</h2>
          <p className={`mx-auto mt-3 max-w-md ${PULSE.body}`}>
            Cuando agregues productos desde el catálogo, aparecerán aquí con sus
            datos reales.
          </p>
          <Link
            href="/home"
            className={`${PULSE.btnPrimary} mt-6 inline-block`}
          >
            Ir al catálogo
          </Link>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
          <article className={`${PULSE.card} p-5 sm:p-6`}>
            <div className="mb-4 flex items-center justify-between border-b border-[#1877F2]/10 pb-4">
              <h2 className={PULSE.h2}>Productos en tu carrito</h2>
              <span className="rounded-full bg-[#E7F3FF] px-3 py-1 text-xs font-semibold text-[#1877F2]">
                {items.length} items
              </span>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col gap-4 rounded-2xl border border-[#1877F2]/12 ${PULSE.surfaceMuted} p-4 sm:flex-row sm:items-center sm:justify-between`}
                >
                  <div className="flex items-center gap-4">
                    <CartImage src={item.image} alt={item.name} />
                    <div>
                      <p className="text-base font-semibold text-[#1C1E21]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-[#65676B]">
                        {categoryLabel(item.categoryId)}
                      </p>
                      <p className="mt-1 text-xs text-[#65676B]">
                        ${item.price.toFixed(2)} c/u
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                    <div className="inline-flex items-center rounded-full border border-[#DADDE1] bg-white">
                      <button
                        type="button"
                        onClick={() => handleDec(item.id, item.qty)}
                        aria-label="Disminuir cantidad"
                        className="h-8 w-8 cursor-pointer rounded-full text-[#1C1E21] transition hover:bg-[#F0F2F5]"
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold text-[#1C1E21]">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleInc(item.id, item.qty)}
                        aria-label="Aumentar cantidad"
                        className="h-8 w-8 cursor-pointer rounded-full text-[#1C1E21] transition hover:bg-[#F0F2F5]"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-base font-bold text-[#1877F2]">
                      ${(item.price * item.qty).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="cursor-pointer text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-[#1877F2]/10 pt-6">
              {clientUser ? (
                <Link
                  href="/cart/ubicacion"
                  className={`${PULSE.btnSecondary} inline-flex w-full cursor-pointer items-center justify-center py-3 text-center sm:w-auto`}
                >
                  Elegir dirección de envío
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  title="Inicia sesión para elegir dirección de envío"
                  className={`${PULSE.btnSecondary} inline-flex w-full items-center justify-center py-3 text-center opacity-60 cursor-not-allowed sm:w-auto`}
                >
                  Elegir dirección de envío
                </span>
              )}
              <p className={`mt-2 text-xs ${PULSE.body}`}>
                {clientUser
                  ? "Código postal, dirección con Google Maps o pin manual; se guarda como dirección de entrega en tu cuenta."
                  : "Inicia sesión para elegir la dirección de envío y guardarla en tu cuenta."}
              </p>
              {!clientUser ? (
                <p className="mt-2 text-xs">
                  <Link href="/login" className={PULSE.link}>
                    Iniciar sesión
                  </Link>{" "}
                  ·{" "}
                  <Link href="/register" className={PULSE.link}>
                    Crear cuenta
                  </Link>
                </p>
              ) : null}
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
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-[#65676B]">
                <span>Envio</span>
                <span>
                  {totals.shipping === 0
                    ? "Gratis"
                    : `$${totals.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#65676B]">
                <span>Impuestos</span>
                <span>${totals.taxes.toFixed(2)}</span>
              </div>
              <div className="my-3 border-t border-[#1877F2]/10" />
              <div className="flex items-center justify-between text-base font-bold text-[#1C1E21]">
                <span>Total</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>

            {clientUser ? (
              <Link
                href="/checkout"
                className={`mt-6 block ${PULSE.btnPrimaryBlock} text-center`}
              >
                Proceder al pago
              </Link>
            ) : (
              <>
                <span
                  aria-disabled="true"
                  title="Inicia sesión para proceder al pago"
                  className={`mt-6 block ${PULSE.btnPrimaryBlock} text-center opacity-60 cursor-not-allowed`}
                >
                  Proceder al pago
                </span>
                <p className="mt-2 text-center text-xs text-[#65676B]">
                  Necesitas iniciar sesión para continuar.{" "}
                  <Link href="/login" className={PULSE.link}>
                    Iniciar sesión
                  </Link>
                </p>
              </>
            )}
            <Link
              href="/home"
              className={`mt-3 block w-full ${PULSE.btnSecondary} py-3 text-center`}
            >
              Seguir comprando
            </Link>
          </aside>
        </section>
      )}
    </PageShell>
  );
}

export default CartPage;
