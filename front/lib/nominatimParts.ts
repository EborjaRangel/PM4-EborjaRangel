import type { DeliveryAddressParts } from "@/lib/deliveryLocationCompose";

/** Convierte `address` de Nominatim (reverse/search) a campos del formulario. */
export function nominatimAddressToParts(
  addr: Record<string, string> | undefined,
  displayName?: string,
): DeliveryAddressParts {
  if (!addr) {
    return {
      street: displayName?.split(",")[0]?.trim() ?? "",
      exterior: "",
      colony: "",
      postalCode: "",
      locality: "",
    };
  }

  const street =
    addr.road ||
    addr.pedestrian ||
    addr.path ||
    addr.residential ||
    "";
  const exterior = addr.house_number || "";
  const colony =
    addr.suburb ||
    addr.neighbourhood ||
    addr.quarter ||
    addr.city_district ||
    "";
  const postalCode = addr.postcode || "";
  const locality =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    addr.state ||
    "";

  const streetFinal =
    street || (displayName ? displayName.split(",")[0]?.trim() ?? "" : "");

  return {
    street: streetFinal,
    exterior,
    colony,
    postalCode,
    locality,
  };
}
