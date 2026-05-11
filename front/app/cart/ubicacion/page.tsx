import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import DeliveryLocationPicker from "@/components/DeliveryLocationPicker/DeliveryLocationPicker";
import AddressBook from "@/components/AddressBook/AddressBook";
import { PULSE } from "@/lib/pulse";

/** La clave no debe quedar vacía tras `npm run build` sin CI. */
export const dynamic = "force-dynamic";

function resolveMapsApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    ""
  );
}

export default function CartUbicacionPage() {
  const mapsApiKey = resolveMapsApiKey();

  return (
    <PageShell>
      <section className={`mb-6 ${PULSE.card} p-6 sm:p-8`}>
        <Link href="/cart" className={`text-sm ${PULSE.link}`}>
          ← Volver al carrito
        </Link>
        <p className={`mt-4 ${PULSE.kicker}`}>ENTREGA</p>
        <h1 className={`mt-2 ${PULSE.h1}`}>Ubicación en mapa</h1>
        <p className={`mt-3 max-w-3xl ${PULSE.body}`}>
          Busca por código postal, usa el autocompletado de Google o coloca el pin
          en el mapa. Los campos se rellenan automáticamente y puedes corregirlos
          antes de guardar la dirección de envío en tu cuenta.
        </p>
      </section>

      <section className={`mb-6 ${PULSE.card} p-6 sm:p-8`}>
        <AddressBook
          hideWhenEmpty
          title="Direcciones que ya tienes guardadas"
          subtitle="Puedes elegir cuál usar al pagar marcándola como predeterminada, editarla o eliminarla."
        />
      </section>

      <section className={`${PULSE.card} p-6 sm:p-8`}>
        <p className={PULSE.kicker}>NUEVA DIRECCIÓN</p>
        <h2 className={`mt-2 ${PULSE.h2}`}>Agregar otra dirección</h2>
        <p className={`mt-2 text-sm ${PULSE.body}`}>
          Busca por código postal, escribe en el buscador, o mueve el pin en el
          mapa para añadir una dirección nueva a tu libreta.
        </p>
        <div className="mt-6">
          <DeliveryLocationPicker mapsApiKey={mapsApiKey} />
        </div>
      </section>
    </PageShell>
  );
}
