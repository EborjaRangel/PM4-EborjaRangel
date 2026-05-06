import React from "react";
import Link from "next/link";
import CardContainer from "@/components/CardContainer";
import CatalogProductCount from "@/components/CatalogProductCount";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";

type HomePageProps = {
  searchParams: Promise<{ pago?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams;
  const pagoOk = sp.pago === "ok";

  return (
    <PageShell>
      {pagoOk ? (
        <div
          className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:px-5"
          role="status"
        >
          <strong className="font-semibold">Pago simulado correctamente.</strong>{" "}
          Gracias por tu compra en PULSE (demo: no se procesó un cobro real).
        </div>
      ) : null}
      <section className={`${PULSE.card} p-6 sm:p-10`}>
        <p className={PULSE.kicker}>CATÁLOGO OFICIAL PULSE</p>
        <h1 className={`mt-3 ${PULSE.h1}`}>Home ecommerce profesional</h1>
        <p className={`mt-3 max-w-3xl ${PULSE.body}`}>
          Explora una selección premium de tecnología. Productos listos para
          envío, pagos seguros y soporte de primer nivel.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <CatalogProductCount />
          <span className={PULSE.pillNeutral}>Envíos en 24-48h</span>
          <span className={PULSE.pillNeutral}>Garantía oficial</span>
        </div>

        <div className="mt-7">
          <Link href="/landing" className={PULSE.btnGhost}>
            Ver landing de marca
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className={PULSE.h2}>Destacados</h2>
          <p className="text-sm text-[#65676B]">Actualizado esta semana</p>
        </div>
        <CardContainer />
      </section>
    </PageShell>
  );
}
