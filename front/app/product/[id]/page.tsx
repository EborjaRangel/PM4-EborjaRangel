import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPageById({ params }: ProductPageProps) {
  const { id } = await params;

  return (
    <PageShell>
      <section className={`${PULSE.card} p-8 sm:p-10`}>
        <p className={PULSE.kicker}>DETALLE DE PRODUCTO</p>
        <h1 className={`mt-2 ${PULSE.h1}`}>Ficha del artículo</h1>
        <p className={`mt-2 ${PULSE.body}`}>
          Vista de maquetación; conecta aquí tu API cuando esté lista.
        </p>

        <article className="mt-8">
          <p className="text-sm text-[#65676B]">ID desde la URL</p>
          <p className="mt-1 font-semibold text-[#1877F2]">Producto #{id}</p>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="h-64 rounded-2xl border border-[#1877F2]/12 bg-[#E7F3FF]/40" />

            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-[#1C1E21]">
                Nombre del producto (mock)
              </h2>
              <p className={PULSE.body}>
                Descripción del producto (mock). Esta sección queda preparada
                para datos reales del backend.
              </p>
              <p className="text-[#1C1E21]">
                <span className="font-medium">Precio:</span>{" "}
                <span className="font-bold text-[#1877F2]">$99.99</span> (mock)
              </p>
              <p className="text-[#1C1E21]">
                <span className="font-medium">Stock:</span> 0 unidades (mock)
              </p>
              <button type="button" className={`mt-2 ${PULSE.btnPrimary}`}>
                Agregar al carrito
              </button>
            </div>
          </div>
        </article>
      </section>
    </PageShell>
  );
}
