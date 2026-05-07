"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  type Libraries,
} from "@react-google-maps/api";
import { ValidationError } from "yup";
import {
  getCurrentUser,
  updateCurrentUserAddressOnly,
} from "@/lib/authStorage";
import {
  composeDeliveryAddress,
  DEFAULT_MAP_CENTER,
  type DeliveryAddressParts,
} from "@/lib/deliveryLocationCompose";
import { deliveryAddressYup } from "@/lib/deliveryContact.validation";
import { PULSE } from "@/lib/pulse";

const libraries: Libraries = ["places"];

const mapContainerStyle = { width: "100%", height: "100%" };

function pickComponent(
  comps: google.maps.GeocoderAddressComponent[],
  ...types: string[]
): string {
  const found = comps.find((c) =>
    types.some((t) => c.types.includes(t)),
  );
  return found?.long_name ?? "";
}

function partsFromComponents(
  comps: google.maps.GeocoderAddressComponent[],
): DeliveryAddressParts {
  return {
    street: pickComponent(comps, "route"),
    exterior: pickComponent(comps, "street_number"),
    colony: pickComponent(
      comps,
      "sublocality_level_1",
      "sublocality",
      "neighborhood",
      "administrative_area_level_3",
    ),
    postalCode: pickComponent(comps, "postal_code"),
    locality: pickComponent(comps, "locality"),
  };
}

type DeliveryMapInnerProps = {
  apiKey: string;
};

function DeliveryMapInner({ apiKey }: DeliveryMapInnerProps) {
  const router = useRouter();
  const { isLoaded, loadError } = useJsApiLoader({
    id: "pulse-google-maps",
    googleMapsApiKey: apiKey,
    libraries,
    language: "es",
    region: "MX",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const autocompleteInputRef = useRef<HTMLInputElement | null>(null);

  const [center, setCenter] = useState(DEFAULT_MAP_CENTER);
  const [marker, setMarker] = useState(DEFAULT_MAP_CENTER);

  const [street, setStreet] = useState("");
  const [exterior, setExterior] = useState("");
  const [colony, setColony] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [locality, setLocality] = useState("");
  const [betweenA, setBetweenA] = useState("");
  const [betweenB, setBetweenB] = useState("");

  const [cpQuery, setCpQuery] = useState("");
  const [geoBusy, setGeoBusy] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  const applyParts = useCallback((parts: DeliveryAddressParts) => {
    setStreet(parts.street);
    setExterior(parts.exterior);
    setColony(parts.colony);
    setPostalCode(parts.postalCode);
    setLocality(parts.locality);
  }, []);

  const applyGeocoderResult = useCallback(
    (result: google.maps.GeocoderResult) => {
      const parts = partsFromComponents(result.address_components);
      if (!parts.street && result.formatted_address) {
        setStreet(result.formatted_address.split(",")[0]?.trim() ?? "");
      } else {
        applyParts(parts);
      }
      const loc = result.geometry?.location;
      if (loc) {
        const lat = loc.lat();
        const lng = loc.lng();
        const pos = { lat, lng };
        setMarker(pos);
        setCenter(pos);
        mapRef.current?.panTo(pos);
        mapRef.current?.setZoom(17);
      }
    },
    [applyParts],
  );

  const reverseGeocode = useCallback(
    (lat: number, lng: number) => {
      const geocoder = geocoderRef.current;
      if (!geocoder) return;
      setGeoBusy(true);
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        setGeoBusy(false);
        if (status === "OK" && results?.[0]) {
          applyGeocoderResult(results[0]);
        }
      });
    },
    [applyGeocoderResult],
  );

  useEffect(() => {
    if (!isLoaded) return;
    geocoderRef.current = new google.maps.Geocoder();
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !autocompleteInputRef.current) return;
    const input = autocompleteInputRef.current;
    const ac = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: ["mx"] },
      fields: ["address_components", "geometry", "formatted_address"],
      types: ["address"],
    });

    const listener = ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const comps = place.address_components;
      const loc = place.geometry?.location;
      if (!loc) return;

      const lat = loc.lat();
      const lng = loc.lng();
      const pos = { lat, lng };
      setMarker(pos);
      setCenter(pos);
      mapRef.current?.panTo(pos);
      mapRef.current?.setZoom(17);

      if (comps?.length) {
        applyParts(partsFromComponents(comps));
      } else if (place.formatted_address) {
        setStreet(place.formatted_address);
      }
      input.value = "";
    });

    return () => {
      google.maps.event.removeListener(listener);
      google.maps.event.clearInstanceListeners(ac);
    };
  }, [isLoaded, applyParts]);

  function handleSearchPostal() {
    const digits = cpQuery.replace(/\D/g, "").slice(0, 5);
    if (digits.length < 4) {
      setSaveErr("Ingresa un codigo postal valido (4 o 5 digitos).");
      return;
    }
    setSaveErr("");
    const geocoder = geocoderRef.current;
    if (!geocoder) return;
    setGeoBusy(true);
    geocoder.geocode(
      {
        address: `${digits}, México`,
        region: "MX",
      },
      (results, status) => {
        setGeoBusy(false);
        if (status === "OK" && results?.[0]) {
          applyGeocoderResult(results[0]);
          setPostalCode(digits);
        } else {
          setSaveErr(
            "No encontramos esa zona. Prueba otro CP o busca en el mapa.",
          );
        }
      },
    );
  }

  async function handleSaveAddress() {
    setSaveErr("");
    setSaveOk(false);

    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const composed = composeDeliveryAddress({
      street,
      exterior,
      colony,
      postalCode,
      locality,
      betweenA,
      betweenB,
    });

    try {
      await deliveryAddressYup.validate(composed);
    } catch (e) {
      const msg =
        e instanceof ValidationError
          ? e.errors[0] ?? e.message
          : "Revisa los datos de la direccion.";
      setSaveErr(msg);
      return;
    }

    const result = await updateCurrentUserAddressOnly(composed);
    if (!result.ok) {
      setSaveErr(result.message);
      return;
    }

    setSaveOk(true);
  }

  if (loadError) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        No se pudo cargar Google Maps. Comprueba la clave de API y la facturacion del proyecto en Google Cloud.
      </p>
    );
  }

  if (!isLoaded) {
    return (
      <p className={`text-center ${PULSE.body}`}>Cargando mapa...</p>
    );
  }

  const loggedIn = Boolean(getCurrentUser());

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)] lg:items-start">
      <div className="space-y-5">
        <div className={PULSE.surfaceMuted}>
          <p className="text-xs font-semibold text-[#65676B]">
            Buscar por código postal (México)
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              className={`${PULSE.input} max-w-[140px]`}
              value={cpQuery}
              onChange={(e) =>
                setCpQuery(e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              placeholder="Ej. 06600"
              aria-label="Codigo postal"
            />
            <button
              type="button"
              onClick={handleSearchPostal}
              disabled={geoBusy}
              className={`${PULSE.btnSecondary} cursor-pointer px-5 disabled:cursor-not-allowed disabled:opacity-60`}
            >
              Buscar zona
            </button>
          </div>
        </div>

        <div className={PULSE.surfaceMuted}>
          <p className="text-xs font-semibold text-[#65676B]">
            Buscar dirección (Google Places)
          </p>
          <input
            ref={autocompleteInputRef}
            type="text"
            className={`${PULSE.input} mt-3`}
            placeholder="Escribe calle y ciudad; elige una sugerencia"
            autoComplete="off"
          />
        </div>

        <div className="space-y-4 rounded-2xl border border-[#1877F2]/12 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1877F2]">
            Dirección detectada (editable)
          </p>
          <label className="block">
            <span className="mb-1 block text-xs text-[#65676B]">Calle</span>
            <input
              className={PULSE.input}
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-[#65676B]">
                Número exterior
              </span>
              <input
                className={PULSE.input}
                value={exterior}
                onChange={(e) => setExterior(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[#65676B]">Colonia</span>
              <input
                className={PULSE.input}
                value={colony}
                onChange={(e) => setColony(e.target.value)}
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-[#65676B]">
                Código postal
              </span>
              <input
                className={PULSE.input}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[#65676B]">
                Ciudad / alcaldía
              </span>
              <input
                className={PULSE.input}
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              />
            </label>
          </div>

          <div className="border-t border-[#1877F2]/10 pt-4">
            <p className="mb-2 text-xs font-semibold text-[#65676B]">
              Entre qué calles (opcional)
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs text-[#65676B]">
                  Calle 1
                </span>
                <input
                  className={PULSE.input}
                  value={betweenA}
                  onChange={(e) => setBetweenA(e.target.value)}
                  placeholder="Ej. Insurgentes"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-[#65676B]">
                  Calle 2
                </span>
                <input
                  className={PULSE.input}
                  value={betweenB}
                  onChange={(e) => setBetweenB(e.target.value)}
                  placeholder="Ej. Chapultepec"
                />
              </label>
            </div>
          </div>

          {geoBusy ? (
            <p className="text-xs text-[#65676B]">Consultando ubicacion...</p>
          ) : null}

          {saveErr ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {saveErr}
            </p>
          ) : null}
          {saveOk ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Direccion guardada en tu cuenta.{" "}
              <Link href="/cart" className={PULSE.link}>
                Volver al carrito
              </Link>
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSaveAddress}
            disabled={!loggedIn}
            className={`${PULSE.btnPrimaryBlock} cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {loggedIn ? "Guardar direccion de entrega" : "Inicia sesion para guardar"}
          </button>
          {!loggedIn ? (
            <Link href="/login" className={`inline-block text-sm ${PULSE.link}`}>
              Ir al login
            </Link>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className={`text-xs ${PULSE.body}`}>
          Toca el mapa o arrastra el pin para afinar la ubicacion; los datos se
          completan con geocodificacion inversa de Google.
        </p>
        <div className="relative min-h-[420px] w-full overflow-hidden rounded-2xl border border-[#1877F2]/15 shadow-[0_8px_32px_rgba(24,119,242,0.12)]">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            onLoad={(m) => {
              mapRef.current = m;
            }}
            onClick={(e) => {
              const latLng = e.latLng;
              if (!latLng) return;
              const lat = latLng.lat();
              const lng = latLng.lng();
              const pos = { lat, lng };
              setMarker(pos);
              mapRef.current?.panTo(pos);
              reverseGeocode(lat, lng);
            }}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            <Marker
              position={marker}
              draggable
              onDragEnd={(e) => {
                const latLng = e.latLng;
                if (!latLng) return;
                const lat = latLng.lat();
                const lng = latLng.lng();
                const pos = { lat, lng };
                setMarker(pos);
                mapRef.current?.panTo(pos);
                reverseGeocode(lat, lng);
              }}
            />
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}

type DeliveryLocationPickerRootProps = {
  /** Preferido: lo envía el servidor desde `.env.local` (NEXT_PUBLIC_* o GOOGLE_MAPS_API_KEY). */
  mapsApiKey?: string;
};

const OpenStreetMapDeliveryPicker = dynamic(
  () => import("./OpenStreetMapDeliveryPicker"),
  {
    ssr: false,
    loading: () => (
      <p className={`text-center ${PULSE.body}`}>Cargando mapa...</p>
    ),
  },
);

export default function DeliveryLocationPicker({
  mapsApiKey,
}: DeliveryLocationPickerRootProps) {
  const apiKey =
    mapsApiKey?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    "";

  if (!apiKey) {
    return (
      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-[#1877F2]/20 bg-[#E7F3FF]/70 px-5 py-4 text-sm text-[#1C1E21]`}
        >
          <p className="font-semibold text-[#1877F2]">Modo gratuito (sin Google)</p>
          <p className={`mt-2 ${PULSE.body}`}>
            No necesitas cuenta ni tarjeta en Google: este mapa usa{" "}
            <strong>OpenStreetMap</strong> y geocodificación pública (Nominatim).
            Si más adelante agregas una API key en{" "}
            <code className="rounded bg-white/90 px-1 font-mono text-xs">
              .env.local
            </code>
            , aquí se usará automáticamente el mapa de Google.
          </p>
        </div>
        <OpenStreetMapDeliveryPicker />
      </div>
    );
  }

  return <DeliveryMapInner apiKey={apiKey} />;
}
