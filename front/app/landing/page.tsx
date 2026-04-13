import React from "react";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import HeroAutoplayVideo from "@/components/landing/HeroAutoplayVideo";
import { PULSE } from "@/lib/pulse";

const FB = "#1877F2";
const TW = "#1DA1F2";

function LandingPage() {
  return (
    <PageShell className="py-10 sm:py-14 lg:py-16">
      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { title: "+10K", subtitle: "Clientes satisfechos", accent: FB },
          { title: "24/7", subtitle: "Atención personalizada", accent: TW },
          { title: "48h", subtitle: "Envíos nacionales", accent: "#4267B2" },
        ].map((item) => (
          <article
            key={item.title}
            className={`${PULSE.cardTight} p-6 transition hover:border-[#1DA1F2]/25 hover:shadow-[0_8px_32px_rgba(29,161,242,0.12)]`}
          >
            <div
              className="mb-3 h-1 w-10 rounded-full"
              style={{ backgroundColor: item.accent }}
            />
            <h3 className="text-2xl font-bold tabular-nums text-[#1C1E21]">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-[#65676B]">{item.subtitle}</p>
          </article>
        ))}
      </section>

      <section className={`relative overflow-hidden ${PULSE.card} p-8 sm:p-10 lg:p-12`}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1877F2] via-[#1DA1F2] to-[#1877F2]"
          aria-hidden
        />

        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
          {/* Izquierda: video y debajo los botones */}
          <div className="flex w-full max-w-[360px] shrink-0 flex-col items-center gap-6 lg:items-start">
            <div className="relative w-full">
              <div
                className="absolute -inset-2 rounded-2xl opacity-50 blur-xl sm:-inset-3"
                style={{
                  background: `linear-gradient(135deg, ${FB}28, ${TW}20)`,
                }}
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-2xl border border-[#1877F2]/25 bg-[#0a1628] shadow-[0_12px_40px_rgba(24,119,242,0.2)]">
                <HeroAutoplayVideo
                  src="/videos/pulse-hero.mp4"
                  className="aspect-video w-full max-h-[200px] object-cover sm:max-h-[240px] lg:max-h-[260px]"
                  aria-label="Video de presentación PULSE"
                />
              </div>
            </div>

            <div className="flex w-full flex-wrap justify-center gap-3 sm:gap-4 lg:justify-start">
              <Link
                href="/home"
                className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(24,119,242,0.45)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1877F2]"
                style={{ backgroundColor: FB }}
              >
                Explorar productos
              </Link>
              <Link
                href="/cart"
                className={`${PULSE.btnSecondary} px-7 py-3.5`}
              >
                Ver carrito
              </Link>
            </div>
          </div>

          {/* Derecha: solo copy */}
          <div className="min-w-0 flex-1">
            <p className="text-left text-xs font-medium tracking-wide text-[#65676B]">
              Presentación PULSE
            </p>

            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#1DA1F2]/35 bg-[#E7F3FF] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#166FE5]">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: TW }}
              />
              NUEVA COLECCIÓN
            </span>

            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight text-[#1C1E21] sm:text-5xl lg:text-[3rem]">
              PULSE: ecommerce{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${FB} 0%, ${TW} 100%)`,
                }}
              >
                profesional
              </span>{" "}
              para tecnología premium.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#65676B] sm:text-lg">
              <span className="font-semibold" style={{ color: FB }}>
                Dreams Time
              </span>{" "}
              es nuestro sello: compra clara, rápida y segura, con la confianza
              de una plataforma pensada para el detalle.
            </p>
          </div>
        </div>
      </section>

      <section
        className={`mt-10 ${PULSE.card} p-8 sm:p-10 lg:p-12`}
        aria-labelledby="product-page-audit-heading"
      >
        <p className={PULSE.kicker}>AUDITORÍA UX</p>
        <h2
          id="product-page-audit-heading"
          className={`mt-2 max-w-3xl ${PULSE.h1}`}
        >
          Tu página de producto hoy: análisis y mejoras sugeridas
        </h2>
        <p className={`mt-3 max-w-3xl ${PULSE.body}`}>
          Revisamos la ruta actual{" "}
          <code className="rounded bg-[#F0F2F5] px-1.5 py-0.5 text-xs font-medium text-[#1C1E21]">
            /product/[id]
          </code>
          : es una maqueta con datos fijos (precio, stock y texto genéricos) y un
          bloque gris en lugar de imagen real. Abajo, prioridades para layout,
          botones, confianza y recorrido de compra.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article
            className={`${PULSE.cardTight} border-[#1877F2]/15 p-6 sm:p-7`}
          >
            <h3 className="text-lg font-semibold text-[#1C1E21]">
              Layout y contenido
            </h3>
            <ul className={`mt-3 list-disc space-y-2 pl-5 text-sm ${PULSE.body}`}>
              <li>
                Conectar la ficha al catálogo real: nombre, descripción, precio y
                stock desde el mismo modelo que en Shop (evita incoherencias).
              </li>
              <li>
                Sustituir el placeholder por galería (imagen principal +
                miniaturas o zoom) y, si aplica, video corto o especificaciones
                en acordeón.
              </li>
              <li>
                En móvil, mantener precio y CTA visibles al hacer scroll
                (barra fija o bloque sticky) para no perder la acción de compra.
              </li>
            </ul>
          </article>

          <article
            className={`${PULSE.cardTight} border-[#1877F2]/15 p-6 sm:p-7`}
          >
            <h3 className="text-lg font-semibold text-[#1C1E21]">
              Botones y microcopy
            </h3>
            <ul className={`mt-3 list-disc space-y-2 pl-5 text-sm ${PULSE.body}`}>
              <li>
                El botón &quot;Agregar al carrito&quot; hoy no tiene efecto: enlázalo al
                estado del carrito o a{" "}
                <Link href="/cart" className={PULSE.link}>
                  /cart
                </Link>{" "}
                con feedback (toast o contador en navbar).
              </li>
              <li>
                Añadir secundaria clara: &quot;Comprar ahora&quot; que lleve a checkout
                cuando el carrito ya incluya el ítem, o cantidad (+/−) antes del
                CTA principal.
              </li>
              <li>
                Deshabilitar el CTA con mensaje explícito si no hay stock; evita
                frustración y refuerza transparencia.
              </li>
            </ul>
          </article>

          <article
            className={`${PULSE.cardTight} border-[#1877F2]/15 p-6 sm:p-7`}
          >
            <h3 className="text-lg font-semibold text-[#1C1E21]">
              Señales de confianza
            </h3>
            <ul className={`mt-3 list-disc space-y-2 pl-5 text-sm ${PULSE.body}`}>
              <li>
                Bloque visible: envío, devoluciones, garantía y métodos de pago
                (alineado con tu landing: atención y plazos de envío).
              </li>
              <li>
                Reseñas o valoración agregada (aunque sea demo) y sello de compra
                segura cerca del precio.
              </li>
              <li>
                Política de privacidad / términos enlazados en el pie o en un
                drawer &quot;Más información&quot; para reducir dudas pre-compra.
              </li>
            </ul>
          </article>

          <article
            className={`${PULSE.cardTight} border-[#1877F2]/15 p-6 sm:p-7`}
          >
            <h3 className="text-lg font-semibold text-[#1C1E21]">
              Flujo de compra
            </h3>
            <ul className={`mt-3 list-disc space-y-2 pl-5 text-sm ${PULSE.body}`}>
              <li>
                Tras añadir al carrito, ofrecer &quot;Seguir comprando&quot; y
                &quot;Ir a pagar&quot; para cerrar el circuito hacia{" "}
                <Link href="/checkout" className={PULSE.link}>
                  checkout
                </Link>
                .
              </li>
              <li>
                Breadcrumb o enlace &quot;Volver al catálogo&quot; para no dejar al
                usuario aislado en la ficha.
              </li>
              <li>
                Mantener coherencia de precios e impuestos entre ficha, carrito y
                pago; un solo origen de verdad evita abandonos por discrepancias.
              </li>
            </ul>
          </article>
        </div>

        <p className="mt-8 text-sm text-[#65676B]">
          Vista previa de una ficha:{" "}
          <Link href="/product/1" className={PULSE.link}>
            abrir producto #1
          </Link>
          .
        </p>
      </section>
    </PageShell>
  );
}

export default LandingPage;
