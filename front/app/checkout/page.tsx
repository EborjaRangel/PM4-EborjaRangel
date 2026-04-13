"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";
import { getMockCartTotals, mockCartItems } from "@/data/mockCart";

type CardBrand = "visa" | "mastercard" | "amex" | "unknown";

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

function detectBrand(pan: string): CardBrand {
  const d = digitsOnly(pan);
  if (d.startsWith("4")) return "visa";
  if (/^3[47]/.test(d)) return "amex";
  if (/^5[1-5]/.test(d)) return "mastercard";
  if (/^2(22[1-9]|2[3-9]\d|[3-6]\d\d|7[01]\d|720)/.test(d))
    return "mastercard";
  return "unknown";
}

function luhnOk(pan: string): boolean {
  const d = digitsOnly(pan);
  if (d.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i]!, 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function formatPan(value: string, brand: CardBrand) {
  const d = digitsOnly(value).slice(0, brand === "amex" ? 15 : 16);
  if (brand === "amex") {
    const p = [];
    if (d.length > 0) p.push(d.slice(0, 4));
    if (d.length > 4) p.push(d.slice(4, 10));
    if (d.length > 10) p.push(d.slice(10, 15));
    return p.join(" ");
  }
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export default function CheckoutPage() {
  const router = useRouter();
  const { subtotal, shipping, taxes, total } = useMemo(
    () => getMockCartTotals(),
    [],
  );

  const [holder, setHolder] = useState("");
  const [pan, setPan] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");

  const brand = useMemo(() => detectBrand(pan), [pan]);
  const panFormatted = useMemo(() => formatPan(pan, brand), [pan, brand]);
  const maxCvv = brand === "amex" ? 4 : 3;
  const maxPanLen = brand === "amex" ? 15 : 16;

  function handlePanChange(raw: string) {
    const d = digitsOnly(raw).slice(0, maxPanLen);
    setPan(d);
  }

  function handleExpiryChange(raw: string) {
    let d = digitsOnly(raw).slice(0, 4);
    if (d.length >= 2) d = `${d.slice(0, 2)}/${d.slice(2)}`;
    setExpiry(d);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const panD = digitsOnly(pan);
    if (holder.trim().length < 3) {
      setError("Ingresa el nombre como aparece en la tarjeta.");
      return;
    }
    if (brand === "unknown") {
      setError("Usa una tarjeta Visa, Mastercard o American Express.");
      return;
    }
    if (brand === "amex" && panD.length !== 15) {
      setError("American Express requiere 15 dígitos.");
      return;
    }
    if (brand !== "amex" && panD.length !== 16) {
      setError("La tarjeta debe tener 16 dígitos.");
      return;
    }
    if (!luhnOk(panD)) {
      setError("El número de tarjeta no es válido (verificación).");
      return;
    }
    const exp = digitsOnly(expiry);
    if (exp.length !== 4) {
      setError("Vencimiento en formato MM/AA.");
      return;
    }
       const mm = parseInt(exp.slice(0, 2), 10);
    const yy = parseInt(exp.slice(2, 4), 10);
    if (mm < 1 || mm > 12) {
      setError("Mes de vencimiento inválido.");
      return;
    }
    const now = new Date();
    const cy = now.getFullYear();
    const cm = now.getMonth() + 1;
    if (2000 + yy < cy || (2000 + yy === cy && mm < cm)) {
      setError("La tarjeta está vencida.");
      return;
    }
    const cvvD = digitsOnly(cvv);
    if (cvvD.length !== maxCvv) {
      setError(
        brand === "amex"
          ? "CVV de 4 dígitos (Amex)."
          : "CVV de 3 dígitos.",
      );
      return;
    }

    router.push("/home?pago=ok");
  }

  return (
    <PageShell>
      <section className={`mb-6 ${PULSE.card} p-8 sm:p-10`}>
        <p className={PULSE.kicker}>PAGO SEGURO PULSE</p>
        <h1 className={`mt-2 ${PULSE.h1}`}>Pagar con tarjeta</h1>
        <p className={`mt-3 max-w-2xl ${PULSE.body}`}>
          Tarjeta de crédito o débito. Aceptamos Visa, Mastercard y American
          Express.{" "}
          <span className="font-medium text-[#1C1E21]">
            Demostración: no se cobra ni se envían datos a un procesador real.
          </span>
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className={`${PULSE.card} p-6 sm:p-8`}>
          <h2 className={PULSE.h2}>Datos de la tarjeta</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            {(
              [
                ["visa", "Visa"],
                ["mastercard", "Mastercard"],
                ["amex", "American Express"],
              ] as const
            ).map(([key, label]) => (
              <span
                key={key}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  brand === key
                    ? "border-[#1877F2] bg-[#E7F3FF] text-[#1877F2]"
                    : "border-[#DADDE1] bg-white text-[#65676B]"
                }`}
              >
                {label}
                {brand === key ? " · detectada" : ""}
              </span>
            ))}
            {brand === "unknown" && pan.length > 0 ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                Escribe el número para detectar la red
              </span>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
                Nombre en la tarjeta
              </span>
              <input
                className={PULSE.input}
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                placeholder="Como figura en la tarjeta"
                autoComplete="cc-name"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
                Número de tarjeta
              </span>
              <input
                className={PULSE.input}
                inputMode="numeric"
                value={panFormatted}
                onChange={(e) => handlePanChange(e.target.value)}
                placeholder={
                  brand === "amex"
                    ? "0000 000000 00000"
                    : "0000 0000 0000 0000"
                }
                autoComplete="cc-number"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
                  Vencimiento (MM/AA)
                </span>
                <input
                  className={PULSE.input}
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  placeholder="MM/AA"
                  autoComplete="cc-exp"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
                  {brand === "amex" ? "CVV (4 dígitos)" : "CVV (3 dígitos)"}
                </span>
                <input
                  className={PULSE.input}
                  inputMode="numeric"
                  value={cvv}
                  onChange={(e) =>
                    setCvv(digitsOnly(e.target.value).slice(0, maxCvv))
                  }
                  placeholder={brand === "amex" ? "0000" : "000"}
                  autoComplete="cc-csc"
                />
              </label>
            </div>

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <button type="submit" className={PULSE.btnPrimaryBlock}>
              Pagar ${total.toFixed(2)}
            </button>
          </form>

          <Link
            href="/cart"
            className={`mt-4 inline-block text-sm ${PULSE.link}`}
          >
            ← Volver al carrito
          </Link>
        </section>

        <aside className={`h-fit ${PULSE.card} p-6`}>
          <h2 className={PULSE.h2}>Resumen</h2>
          <ul className="mt-4 space-y-2 text-sm text-[#65676B]">
            {mockCartItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between gap-2 border-b border-[#1877F2]/10 py-2 last:border-0"
              >
                <span>
                  {item.name}{" "}
                  <span className="text-xs">×{item.qty}</span>
                </span>
                <span className="shrink-0 font-medium text-[#1C1E21]">
                  ${(item.price * item.qty).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-[#1877F2]/10 pt-4 text-sm">
            <div className="flex justify-between text-[#65676B]">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#65676B]">
              <span>Envío</span>
              <span>
                {shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-[#65676B]">
              <span>Impuestos</span>
              <span>${taxes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold text-[#1C1E21]">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
