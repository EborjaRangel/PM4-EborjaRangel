/* eslint-disable no-console */
/**
 * Convierte el nombre y la descripción de TODOS los productos a MAYÚSCULAS.
 *
 * Uso:
 *   node back/scripts/uppercase-products.js
 *
 * - Usa toLocaleUpperCase("es-MX") para que la Ñ y los acentos se manejen
 *   correctamente en español.
 * - Omite productos cuyo name y description ya están en mayúsculas.
 */

const API_URL = process.env.API_URL || "http://localhost:3000";
const LOCALE = "es-MX";

function isAlreadyUpper(text) {
  const t = (text ?? "").toString();
  return t.toLocaleUpperCase(LOCALE) === t;
}

async function main() {
  const r = await fetch(`${API_URL}/products`);
  if (!r.ok) {
    console.error("No se pudo obtener productos:", r.status);
    return;
  }
  const products = await r.json();
  if (!Array.isArray(products)) {
    console.error("Respuesta inesperada.");
    return;
  }

  console.log(`Total productos a revisar: ${products.length}`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of products) {
    const currentName = (p?.name ?? "").toString();
    const currentDesc = (p?.description ?? "").toString();

    if (isAlreadyUpper(currentName) && isAlreadyUpper(currentDesc)) {
      console.log(`SKIP id=${p.id}  (ya en mayúsculas) ${currentName}`);
      skipped++;
      continue;
    }

    const newName = currentName.toLocaleUpperCase(LOCALE);
    const newDesc = currentDesc.toLocaleUpperCase(LOCALE);

    const body = {
      name: newName,
      description: newDesc,
      price: Number(p.price),
      stock: Number(p.stock),
      categoryId: Number(p.categoryId),
      image: p.image,
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : undefined,
    };

    try {
      const res = await fetch(`${API_URL}/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        console.log(`OK   id=${p.id}  ${newName}`);
        updated++;
      } else {
        const t = await res.text();
        console.error(`FAIL id=${p.id} ${res.status} ${t}`);
        failed++;
      }
    } catch (e) {
      console.error(`ERR  id=${p.id}:`, e.message);
      failed++;
    }
  }

  console.log("\n---");
  console.log(`Actualizados=${updated}  Omitidos=${skipped}  Fallidos=${failed}`);
}

main();
