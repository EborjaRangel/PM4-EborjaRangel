export type DeliveryAddressParts = {
  street: string;
  exterior: string;
  colony: string;
  postalCode: string;
  locality: string;
};

export const DEFAULT_MAP_CENTER = { lat: 19.432608, lng: -99.133209 };

export function composeDeliveryAddress(p: {
  street: string;
  exterior: string;
  colony: string;
  postalCode: string;
  locality: string;
  betweenA: string;
  betweenB: string;
}): string {
  const line1 = [
    p.street.trim(),
    p.exterior.trim() ? `#${p.exterior.trim()}` : "",
    p.colony.trim() ? `Col. ${p.colony.trim()}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const line2 = [
    p.postalCode.trim() ? `C.P. ${p.postalCode.trim()}` : "",
    p.locality.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  const lines = [line1, line2].filter(Boolean);

  const a = p.betweenA.trim();
  const b = p.betweenB.trim();
  if (a && b) {
    lines.push(`Entre calles ${a} y ${b}`);
  } else if (a) {
    lines.push(`Referencias / entre calles: ${a}`);
  } else if (b) {
    lines.push(`Referencias / entre calles: ${b}`);
  }

  return lines.join("\n");
}
