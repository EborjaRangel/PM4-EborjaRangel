"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";
import { fetchPurchaseById, type IPurchaseRecord } from "@/lib/purchaseHistory";
import { categoryLabel } from "@/data/productCategories";
import PurchaseShippingMapFromAddress from "@/components/PurchaseShippingMap/PurchaseShippingMapFromAddress";

function fmt(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

type Phase = "loading" | "ready" | "not-found" | "error";

export default function EnvioOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [order, setOrder] = useState<IPurchaseRecord | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    fetchPurchaseById(id)
      .then((rec) => {
        if (cancelled) return;
        if (!rec) {
          setPhase("not-found");
          setOrder(null);
        } else {
          setOrder(rec);
          setPhase("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (phase === "loading") {
    return (
      <PageShell>
        <p className={`text-center ${PULSE.body}`}>Cargando envío…</p>
      </PageShell>
    );
  }

  if (phase === "not-found") {
    return (
      <PageShell>
        <section className={`${PULSE.card} p-6 text-center sm:p-10`}>
          <h1 className={PULSE.h1}>Envío no encontrado</h1>
          <p className={`mx-auto mt-3 max-w-md ${PULSE.body}`}>
            El código QR escaneado no corresponde a ningún pedido registrado.
          </p>
          <Link href="/home" className={`${PULSE.btnPrimary} mt-6 inline-block`}>
            Ir al inicio
          </Link>
        </section>
      </PageShell>
    );
  }

  if (phase === "error" || !order) {
    return (
      <PageShell>
        <section
          className={`${PULSE.card} border border-red-200 bg-red-50/80 p-6 sm:p-8`}
          role="alert"
        >
          <p className="text-sm text-red-700">
            No se pudo cargar el detalle de envío. Vuelve a intentarlo más
            tarde.
          </p>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className={`${PULSE.card} p-6 sm:p-8`}>
        <p className={PULSE.kicker}>DETALLE DE ENVÍO</p>
        <h1 className={`mt-2 ${PULSE.h1}`}>Pedido #{order.id.slice(0, 8)}</h1>
        <p className={`mt-2 max-w-2xl ${PULSE.body}`}>
          Información completa del envío de esta compra. Esta página se abre al
          escanear el código QR del pedido.
        </p>
        <p className="mt-3 text-sm text-[#65676B]">
          Fecha:{" "}
          <span className="font-medium text-[#1C1E21]">
            {new Date(order.createdAt).toLocaleString("es", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </p>
      </section>

      <section className={`mt-6 ${PULSE.card} p-6 sm:p-8`}>
        <h2 className={PULSE.h2}>Dirección de envío</h2>
        {order.shipping ? (
          <>
            {order.shipping.address ? (
              <p
                className={`mt-3 whitespace-pre-wrap text-sm text-[#1C1E21] ${PULSE.body}`}
              >
                {order.shipping.address}
              </p>
            ) : (
              <p className={`mt-3 text-sm text-[#65676B] ${PULSE.body}`}>
                No se registró una dirección al momento del pedido.
              </p>
            )}
            {order.shipping.phone ? (
              <p className={`mt-2 text-sm ${PULSE.body}`}>
                Teléfono de contacto:{" "}
                <span className="font-medium text-[#1C1E21]">
                  {order.shipping.phone}
                </span>
              </p>
            ) : null}
            <PurchaseShippingMapFromAddress
              address={order.shipping.address}
              savedLat={order.shipping.lat}
              savedLng={order.shipping.lng}
            />
          </>
        ) : (
          <p className={`mt-3 text-sm text-[#65676B] ${PULSE.body}`}>
            Este pedido no incluye datos de envío.
          </p>
        )}
      </section>

      <section className={`mt-6 ${PULSE.card} p-6 sm:p-8`}>
        <h2 className={PULSE.h2}>Productos del pedido</h2>
        <ul className="mt-4 divide-y divide-[#DADDE1]">
          {order.items.map((item) => (
            <li
              key={`${order.id}-${item.id}`}
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-[#1C1E21]">{item.name}</p>
                <p className="text-xs text-[#65676B]">
                  {categoryLabel(item.categoryId)} · ${item.price.toFixed(2)} c/u
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-[#65676B]">
                <span>Cant. {item.qty}</span>
                <span className="font-bold tabular-nums text-[#1877F2]">
                  ${fmt(item.price * item.qty)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-1 border-t border-[#1877F2]/10 pt-4 text-sm text-[#65676B]">
          <div className="flex justify-between gap-3 tabular-nums">
            <span>Subtotal</span>
            <span>${fmt(order.totals.subtotal)}</span>
          </div>
          <div className="flex justify-between gap-3 tabular-nums">
            <span>Envío</span>
            <span>
              {order.totals.shipping === 0
                ? "Gratis"
                : `$${fmt(order.totals.shipping)}`}
            </span>
          </div>
          <div className="flex justify-between gap-3 tabular-nums">
            <span>Impuestos</span>
            <span>${fmt(order.totals.taxes)}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-[#1877F2]/15 pt-3 text-base font-bold tabular-nums text-[#1877F2]">
            <span>Total</span>
            <span>${fmt(order.totals.total)}</span>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
