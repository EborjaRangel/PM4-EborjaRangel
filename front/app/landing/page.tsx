import React from "react";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import HeroAutoplayVideo from "@/components/landing/HeroAutoplayVideo";
import { PULSE } from "@/lib/pulse";

const FB = "#1877F2";
const TW = "#1DA1F2";

function LandingPage() {
  return (
    <PageShell shellTight>
      <section className="mb-2 grid gap-2 sm:grid-cols-3 sm:gap-3">
        {[
          { title: "+10K", subtitle: "Clientes satisfechos", accent: FB },
          { title: "24/7", subtitle: "Atención personalizada", accent: TW },
          { title: "48h", subtitle: "Envíos nacionales", accent: "#4267B2" },
        ].map((item) => (
          <article
            key={item.title}
            className={`${PULSE.cardTight} px-3 py-3 transition hover:border-[#1DA1F2]/25 hover:shadow-[0_8px_32px_rgba(29,161,242,0.12)] sm:px-4 sm:py-3.5`}
          >
            <div
              className="mb-2 h-0.5 w-8 rounded-full"
              style={{ backgroundColor: item.accent }}
            />
            <h3 className="text-lg font-bold tabular-nums text-[#1C1E21] sm:text-xl">
              {item.title}
            </h3>
            <p className="mt-0.5 text-xs text-[#65676B] sm:text-sm">{item.subtitle}</p>
          </article>
        ))}
      </section>

      <section
        className={`relative overflow-hidden ${PULSE.card} px-4 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5`}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1877F2] via-[#1DA1F2] to-[#1877F2]"
          aria-hidden
        />

        <div className="relative flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Izquierda: video y debajo los botones */}
          <div className="flex w-full max-w-[360px] shrink-0 flex-col items-center gap-4 lg:items-start">
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
                prefetch={false}
                className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(24,119,242,0.45)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1877F2]"
                style={{ backgroundColor: FB }}
              >
                Explorar productos
              </Link>
              <Link
                href="/cart"
                prefetch={false}
                className={`${PULSE.btnSecondary} px-7 py-3.5`}
              >
                Ver carrito
              </Link>
            </div>
          </div>

          {/* Derecha: solo copy */}
          <div className="min-w-0 flex-1">
            <h1 className="whitespace-nowrap font-bold leading-[1.15] tracking-tight text-[#1C1E21] text-[clamp(0.95rem,4.8vw,2.6rem)]">
              PULSE: ecommerce{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${FB} 0%, ${TW} 100%)`,
                }}
              >
                premium
              </span>
              .
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
    </PageShell>
  );
}

export default LandingPage;
