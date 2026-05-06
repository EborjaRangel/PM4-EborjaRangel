/** Variantes de consulta para Nominatim con direcciones mexicanas compuestas (multilinea). */

function stripBetweenLines(lines: string[]): string[] {
  return lines.filter((l) => !/^entre calles\b/i.test(l));
}

function simplifyStreetLine(line: string): string {
  const colMatch = line.match(/^(.+?)\s+col\.\s*.+$/i);
  const main = colMatch ? colMatch[1] : line;
  return main
    .replace(/^calle\s+/i, "")
    .replace(/#/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPostalAndCity(text: string, lines: string[]): {
  postal?: string;
  city?: string;
} {
  let postal: string | undefined;
  const cpTagged = text.match(/\bC\.?\s*P\.?\s*(\d{5})\b/i);
  if (cpTagged) postal = cpTagged[1];
  else {
    const anyCp = text.match(/\b(\d{5})\b/);
    if (anyCp) postal = anyCp[1];
  }

  let city: string | undefined;
  for (const line of lines) {
    if (!line.includes(",")) continue;
    const parts = line.split(",").map((p) => p.trim());
    const tail = parts[parts.length - 1];
    if (
      tail &&
      tail.length > 2 &&
      !/^\d/.test(tail) &&
      /méxico|mexico|ciudad|cdmx|guadalajara|monterrey|puebla|tijuana/i.test(
        tail,
      )
    ) {
      city = tail;
      break;
    }
    if (parts.length >= 2 && tail && tail.length > 2 && !/^\d/.test(tail)) {
      city = tail;
    }
  }
  return { postal, city };
}

type SearchParams = Record<string, string>;

function buildSearchAttempts(addressText: string): SearchParams[] {
  const raw = addressText.trim();
  if (raw.length < 5) return [];

  const lines = stripBetweenLines(
    raw.split(/\n/).map((l) => l.trim()).filter(Boolean),
  );
  const compact = lines.join(", ").replace(/\s+/g, " ");
  const { postal, city } = extractPostalAndCity(raw, lines);
  const firstLine = lines[0] ?? "";
  const street = simplifyStreetLine(firstLine);

  const attempts: SearchParams[] = [];

  if (street && postal && city) {
    attempts.push({
      street,
      postalcode: postal,
      city,
    });
  }
  if (postal && city) {
    attempts.push({ postalcode: postal, city });
  }
  if (postal && street) {
    attempts.push({ street, postalcode: postal });
  }
  if (postal) {
    attempts.push({ postalcode: postal });
  }
  if (compact.length >= 8) {
    attempts.push({ q: `${compact}, México`, wide: "0" });
    attempts.push({ q: `${compact}, México`, wide: "1" });
  }
  if (postal && city) {
    attempts.push({ q: `${postal}, ${city}, México`, wide: "1" });
  }
  if (street && postal) {
    attempts.push({ q: `${street}, ${postal}, México`, wide: "1" });
  }
  if (street) {
    attempts.push({ q: `${street}, México`, wide: "1" });
  }

  const seen = new Set<string>();
  return attempts.filter((a) => {
    const key = JSON.stringify(a);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchCoords(sp: SearchParams): Promise<{
  lat: number;
  lng: number;
} | null> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v) qs.set(k, v);
  }
  const res = await fetch(`/api/geocode/search?${qs}`, {
    method: "GET",
  });
  const data = (await res.json()) as {
    ok?: boolean;
    lat?: number;
    lng?: number;
  };
  if (
    data?.ok === true &&
    Number.isFinite(data.lat) &&
    Number.isFinite(data.lng)
  ) {
    return { lat: data.lat!, lng: data.lng! };
  }
  return null;
}

/** Intenta obtener coordenadas para guardar en el pedido o mostrar mapa en historial. */
export async function resolveMexicoShippingCoords(
  addressText: string,
): Promise<{ lat: number; lng: number } | null> {
  const attempts = buildSearchAttempts(addressText);
  for (let i = 0; i < attempts.length; i++) {
    const params = attempts[i]!;
    try {
      const hit = await fetchCoords(params);
      if (hit) return hit;
    } catch {
      /* siguiente intento */
    }
    if (i < attempts.length - 1) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  return null;
}
