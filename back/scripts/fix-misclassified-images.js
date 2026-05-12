/* eslint-disable no-console */
/**
 * Corrige 5 productos donde el orden de reglas de tags dio una clasificación
 * incorrecta para las imágenes (loremflickr).
 */

const API_URL = process.env.API_URL || "http://localhost:3000";

const FIXES = [
  { id: 35, tags: ["lenovo", "tablet"] }, // Lenovo Tab P12 Pro
  { id: 47, tags: ["monitor", "4k", "dell"] }, // Dell UltraSharp 27" 4K
  { id: 80, tags: ["markers", "crayola", "art"] }, // Marcadores Crayola lavables
  { id: 81, tags: ["markers", "crayola", "art"] }, // Marcadores Crayola Super Tips 20
  { id: 82, tags: ["markers", "crayola", "art"] }, // Marcadores Crayola Super Tips 50
];

function imagesForTags(productId, tags) {
  const tagStr = tags.join(",");
  return Array.from({ length: 5 }, (_, i) =>
    `https://loremflickr.com/900/900/${encodeURIComponent(tagStr)}?lock=${productId * 7 + i + 1}`
  );
}

async function main() {
  let ok = 0;
  let fail = 0;

  for (const fix of FIXES) {
    const get = await fetch(`${API_URL}/products/${fix.id}`);
    if (!get.ok) {
      console.error(`No pude leer producto ${fix.id}: ${get.status}`);
      fail++;
      continue;
    }
    const p = await get.json();
    const images = imagesForTags(p.id, fix.tags);

    const body = {
      name: p.name,
      description: p.description,
      price: Number(p.price),
      stock: Number(p.stock),
      categoryId: Number(p.categoryId),
      image: images[0],
      images,
    };

    const res = await fetch(`${API_URL}/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      console.log(`OK   id=${p.id}  tags=[${fix.tags.join(",")}]  ${p.name}`);
      ok++;
    } else {
      console.error(`FAIL id=${p.id} ${res.status} ${await res.text()}`);
      fail++;
    }
  }

  console.log(`\nActualizados=${ok}  Fallidos=${fail}`);
}

main();
