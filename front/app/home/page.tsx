import PageShell from "@/components/layout/PageShell";
import HomeCatalog from "@/components/home/HomeCatalog";

type HomePageProps = {
  searchParams: Promise<{ pago?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams;
  const pagoOk = sp.pago === "ok";

  return (
    <PageShell compactTop>
      {pagoOk ? (
        <div
          className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:px-5"
          role="status"
        >
          <strong className="font-semibold">Pago simulado correctamente.</strong>{" "}
          Gracias por tu compra en PULSE (demo: no se procesó un cobro real).
        </div>
      ) : null}
      <section>
        <HomeCatalog />
      </section>
    </PageShell>
  );
}
