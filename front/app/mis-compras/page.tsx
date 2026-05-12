"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";
import { getCurrentUser } from "@/lib/authStorage";
import type { PublicUser } from "@/interfaces/auth.interface";
import {
  fetchPurchasesByUserId,
  type IPurchaseRecord,
} from "@/lib/purchaseHistory";
import { categoryLabel } from "@/data/productCategories";
import PurchaseShippingMapFromAddress from "@/components/PurchaseShippingMap/PurchaseShippingMapFromAddress";
import PurchaseQrCode from "@/components/PurchaseQrCode/PurchaseQrCode";
import PurchaseLineItemThumb from "@/components/PurchaseLineItemThumb/PurchaseLineItemThumb";
import { cartItemCoverImage } from "@/lib/cartStorage";
import { formatPrice } from "@/lib/formatPrice";

function formatOrderMoney(value: number): string {
  return formatPrice(value);
}

export default function MisComprasPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [orders, setOrders] = useState<IPurchaseRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    setMounted(true);

    if (!u) {
      setHistoryLoading(false);
      return;
    }

    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError(null);
    fetchPurchasesByUserId(u.id)
      .then((list) => {
        if (!cancelled) setOrders(list);
      })
      .catch(() => {
        if (!cancelled) {
          setHistoryError(
            "No se pudo cargar el historial. Comprueba que el backend este en marcha.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace("/login");
    }
  }, [mounted, user, router]);

  if (!user) {
    return (
      <PageShell>
        <p className={`text-center ${PULSE.body}`}>Cargando...</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className={`${PULSE.card} p-6 sm:p-8`}>
        <p className={PULSE.kicker}>HISTORIAL</p>
        <h1 className={`mt-2 ${PULSE.h1}`}>Mis compras</h1>
        <p className={`mt-2 max-w-2xl ${PULSE.body}`}>
          Compras guardadas en el servidor tras completar el pago de
          demostración. Cada pedido incluye el detalle y totales al momento de la
          compra.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/home" className={PULSE.link}>
            Ir al catálogo
          </Link>
          <span className="text-sm text-[#DADDE1]">|</span>
          <Link href="/profile" className={PULSE.link}>
            Mi perfil
          </Link>
        </div>
      </section>

      {historyError ? (
        <section
          className={`mt-8 ${PULSE.card} border border-red-200 bg-red-50/80 p-6 sm:p-8`}
          role="alert"
        >
          <p className="text-sm text-red-700">{historyError}</p>
        </section>
      ) : null}

      {historyLoading ? (
        <p className={`mt-8 text-center ${PULSE.body}`}>
          Cargando historial...
        </p>
      ) : orders.length === 0 ? (
        <section
          className={`mt-8 ${PULSE.card} p-8 text-center sm:p-10`}
          role="status"
        >
          <h2 className={PULSE.h2}>Aún no hay compras</h2>
          <p className={`mx-auto mt-3 max-w-md ${PULSE.body}`}>
            Cuando completes un pago en{" "}
            <Link href="/checkout" className={PULSE.link}>
              Checkout
            </Link>{" "}
            con sesión iniciada, aparecerán aquí.
          </p>
          <Link
            href="/home"
            className={`${PULSE.btnPrimary} mt-6 inline-block`}
          >
            Explorar productos
          </Link>
        </section>
      ) : (
        <ul className="mt-8 space-y-6">
          {orders.map((order) => (
            <li key={order.id}>
              <article className={`${PULSE.card} p-6 sm:p-8`}>
                <div className="flex flex-col gap-2 border-b border-[#1877F2]/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#65676B]">
                      Pedido
                    </p>
                    <p className="mt-1 font-mono text-sm text-[#1C1E21]">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="mt-2 text-sm text-[#65676B]">
                      {new Date(order.createdAt).toLocaleString("es", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-[#65676B]">Total pagado</p>
                    <p className="text-2xl font-bold tabular-nums text-[#1877F2]">
                      ${formatOrderMoney(order.totals.total)}
                    </p>
                    <p className="mt-1 text-xs text-[#65676B]">
                      Pago simulado · {order.items.length} lineas
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div className="rounded-xl border border-[#1877F2]/12 bg-[#F9FAFB] p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#65676B]">
                      Direccion de envio
                    </p>
                    {order.shipping ? (
                      <>
                        {order.shipping.address ? (
                          <p
                            className={`mt-2 whitespace-pre-wrap text-sm text-[#1C1E21] ${PULSE.body}`}
                          >
                            {order.shipping.address}
                          </p>
                        ) : null}
                        {order.shipping.phone ? (
                          <p className={`mt-2 text-sm text-[#65676B] ${PULSE.body}`}>
                            Telefono:{" "}
                            <span className="font-medium text-[#1C1E21]">
                              {order.shipping.phone}
                            </span>
                          </p>
                        ) : null}
                        {!order.shipping.address && !order.shipping.phone ? (
                          <p className={`mt-2 text-sm text-[#65676B] ${PULSE.body}`}>
                            No había dirección en tu perfil al momento del pedido.
                          </p>
                        ) : null}
                        <PurchaseShippingMapFromAddress
                          address={order.shipping.address}
                          savedLat={order.shipping.lat}
                          savedLng={order.shipping.lng}
                        />
                      </>
                    ) : (
                      <p className={`mt-2 text-sm text-[#65676B] ${PULSE.body}`}>
                        Este pedido no incluye datos de envío guardados (compras
                        anteriores al cambio).
                      </p>
                    )}
                  </div>
                  <div className="flex justify-center sm:justify-end">
                    <PurchaseQrCode order={order} />
                  </div>
                </div>

                <ul className="mt-4 divide-y divide-[#DADDE1]">
                  {order.items.map((item) => (
                    <li
                      key={`${order.id}-${item.id}`}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <PurchaseLineItemThumb
                          src={cartItemCoverImage(item)}
                          alt={item.name}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#1C1E21]">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-xs text-[#65676B]">
                            {categoryLabel(item.categoryId)} · $
                            {formatPrice(item.price)} c/u
                          </p>
                          <p className={`mt-2 text-sm ${PULSE.body} text-[#65676B]`}>
                            Cantidad{" "}
                            <span className="font-semibold tabular-nums text-[#1C1E21]">
                              {item.qty}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 border-t border-[#E8EAED] pt-3 text-right sm:min-w-[7rem] sm:border-0 sm:pt-0 sm:pl-6">
                        <p className="text-lg font-bold tabular-nums leading-tight text-[#1877F2] sm:text-xl">
                          ${formatOrderMoney(item.price * item.qty)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 space-y-1 border-t border-[#1877F2]/10 pt-4 text-sm text-[#65676B]">
                  <div className="flex justify-between gap-3 tabular-nums">
                    <span>Subtotal</span>
                    <span>${formatOrderMoney(order.totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between gap-3 tabular-nums">
                    <span>Envio</span>
                    <span>
                      {order.totals.shipping === 0
                        ? "Gratis"
                        : `$${formatOrderMoney(order.totals.shipping)}`}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 tabular-nums">
                    <span>Impuestos</span>
                    <span>${formatOrderMoney(order.totals.taxes)}</span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-[#1877F2]/15 pt-3 text-base font-bold tabular-nums text-[#1877F2]">
                    <span>Total</span>
                    <span>${formatOrderMoney(order.totals.total)}</span>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
