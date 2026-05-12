/* eslint-disable no-console */
/**
 * Reemplaza las imágenes "aleatorias" (picsum.photos) de los productos
 * por URLs de loremflickr.com que sí coincidan con la descripción del producto.
 *
 * Cada producto recibe 5 URLs nuevas con tags basados en su nombre + categoría:
 *   https://loremflickr.com/900/900/<tags>?lock=<seed>
 *
 * Uso:
 *   node back/scripts/update-product-images.js
 *
 * Solo actualiza los productos cuya imagen actual contiene "picsum.photos",
 * así no se tocan los productos originales del usuario.
 */

const API_URL = process.env.API_URL || "http://localhost:3000";

// Reglas: si el nombre del producto matchea el regex, usa esos tags.
// El primer match gana, así que las reglas más específicas van primero.
const TAG_RULES = [
  // -------- Smartphones --------
  [/iphone/i, ["iphone", "smartphone", "apple"]],
  [/galaxy\s*s\d+|samsung\s*galaxy(?!\s*tab)/i, ["samsung", "galaxy", "smartphone"]],
  [/pixel/i, ["pixel", "google", "smartphone"]],

  // -------- Laptops --------
  [/macbook/i, ["macbook", "laptop", "apple"]],
  [/xps|dell\b/i, ["dell", "laptop"]],
  [/thinkpad|lenovo\b/i, ["thinkpad", "laptop", "lenovo"]],

  // -------- Tablets --------
  [/ipad/i, ["ipad", "tablet", "apple"]],
  [/galaxy\s*tab|tab\s*s\d/i, ["samsung", "tablet"]],
  [/tab\s*p\d|lenovo.*tab/i, ["lenovo", "tablet"]],

  // -------- Headphones --------
  [/airpods\s*max/i, ["airpods", "headphones", "apple"]],
  [/airpods/i, ["airpods", "earbuds", "apple"]],
  [/wh-?1000|sony.*headphone|sony.*audífono/i, ["sony", "headphones"]],
  [/bose/i, ["bose", "headphones"]],
  [/audífono|headphone|over-ear|on-ear/i, ["headphones"]],

  // -------- Cameras --------
  [/gopro/i, ["gopro", "actioncamera"]],
  [/sony\s*alpha|a7|alpha\s*a/i, ["sony", "camera", "mirrorless"]],
  [/canon\s*eos/i, ["canon", "camera", "dslr"]],
  [/nikon/i, ["nikon", "camera"]],
  [/cámara|camera/i, ["camera"]],

  // -------- Printers --------
  [/laserjet|láser monocrom|brother.*mfc|láser/i, ["printer", "laser"]],
  [/ecotank|epson/i, ["printer", "inkjet", "epson"]],
  [/impresora|multifuncional|printer/i, ["printer", "office"]],

  // -------- Monitors --------
  [/ultragear|odyssey|gaming.*monitor/i, ["gaming", "monitor"]],
  [/ultrasharp|4k.*monitor/i, ["monitor", "4k"]],
  [/monitor/i, ["monitor", "display"]],

  // -------- Storage --------
  [/sdxc|sd\s*card|tarjeta sd/i, ["sdcard", "memorycard"]],
  [/ssd|nvme|t7\s*shield|sn850/i, ["ssd", "storage", "computer"]],

  // -------- Accessories --------
  [/mx\s*master|logitech.*mouse|\bmouse\b/i, ["mouse", "computer"]],
  [/keychron|teclado\s*mecánico|teclado/i, ["keyboard", "computer"]],
  [/usb-?c\s*hub|usbhub|anker/i, ["usbhub", "computer"]],

  // -------- Oficina --------
  [/silla.*oficina|silla\s*ergonómica|office\s*chair/i, ["office", "chair"]],
  [/escritorio|standing\s*desk|desk/i, ["desk", "office"]],
  [/lámpara|lampara|lamp/i, ["lamp", "desk"]],

  // -------- Papelería - escritura --------
  [/portaminas|mechanical\s*pencil/i, ["mechanicalpencil", "pencil"]],
  [/lápiz bicolor|verithin/i, ["pencil", "bicolor"]],
  [/prismacolor.*premier|lápices\s*prismacolor/i, ["coloredpencils", "art"]],
  [/lápices\s+de\s+colores|caja\s*\d+\s*lápices\s*de\s*colores|faber-castell.*colores/i, ["coloredpencils", "school"]],
  [/crayón|crayola|crayon/i, ["crayons", "kids"]],
  [/lápiz/i, ["pencil", "graphite"]],

  [/sharpie|plumón sharpie|permanent\s*marker/i, ["sharpie", "marker"]],
  [/tombow|dual\s*brush/i, ["brushpen", "lettering"]],
  [/super\s*tips|crayola.*marcador|crayola.*lavable|plumones\s*magicolor|plumones\s*pelikan|plumones\s*acuarelab/i, ["markers", "art"]],
  [/marcador.*pizarr|expo\b/i, ["whiteboard", "marker"]],
  [/resaltador|highlighter|stabilo\s*boss|brite\s*liner/i, ["highlighter"]],

  [/pluma\s*fuente|fountain\s*pen|metropolitan/i, ["fountainpen", "pen"]],
  [/frixion/i, ["pen", "frixion"]],
  [/pluma.*g2|gel\s*pen|pilot\s*g2/i, ["gelpen", "pen"]],
  [/estilógrafo|pigment\s*liner/i, ["pen", "drawing"]],
  [/pluma|bolígrafo|bic\s*cristal/i, ["pen", "ballpoint"]],

  // -------- Papelería - papel --------
  [/cuaderno|libreta|notebook/i, ["notebook", "stationery"]],
  [/block.*dibujo|arches|sketchbook/i, ["sketchbook", "art"]],
  [/block.*opalina/i, ["cardstock", "paper"]],
  [/block\s*tamaño\s*carta|block\s*carta\s*blanco|notepad/i, ["notepad", "paper"]],
  [/paquete.*hojas|papel\s*bond|hojas\s*blancas/i, ["paper", "office"]],
  [/cartulina/i, ["cardstock", "paper"]],
  [/foamy/i, ["foam", "craft"]],
  [/papel\s*pergamino/i, ["paper", "vintage"]],
  [/papel\s*crepé/i, ["paper", "craft"]],

  // -------- Papelería - archivo --------
  [/folder\b/i, ["folder", "office"]],
  [/carpeta/i, ["binder", "office"]],
  [/sobre\b/i, ["envelope", "office"]],

  // -------- Papelería - pegamento / cinta --------
  [/pegamento|resistol|pritt|uhu|kores/i, ["glue"]],
  [/cinta\s*scotch|cinta\s*canela|cinta\s*masking|diurex|cinta\s*adhesiv|cinta\s*doble\s*cara/i, ["tape", "adhesive"]],
  [/corrector|wite-out|cinta\s*correctora/i, ["correctionfluid"]],

  // -------- Papelería - cortar / medir / borrar --------
  [/tijeras|scissors/i, ["scissors"]],
  [/sacapuntas|sharpener/i, ["pencilsharpener"]],
  [/goma\s*de\s*borrar|eraser|borrador\b(?!.*pizarr)/i, ["eraser", "stationery"]],
  [/regla\b/i, ["ruler"]],
  [/juego\s*geométrico|geometric/i, ["geometryset", "school"]],
  [/compás/i, ["compass", "geometry"]],
  [/transportador|protractor/i, ["protractor", "geometry"]],
  [/escuadra/i, ["triangle", "geometry"]],
  [/calculadora|casio\s*fx|casio\s*hl/i, ["calculator"]],

  // -------- Papelería - engrapado / clips --------
  [/engrapadora|swingline/i, ["stapler"]],
  [/grapas\b/i, ["staples"]],
  [/sacagrapas/i, ["stapler", "remover"]],
  [/perforadora/i, ["holepunch"]],
  [/clips|paperclip|pinzas\s*binder/i, ["paperclip"]],

  // -------- Papelería - post-it / etiquetas / pizarras --------
  [/post-?it|nota.*adhesiv|sticky\s*notes?|banderitas/i, ["postit", "stickynotes"]],
  [/etiquetas/i, ["labels", "stickers"]],
  [/pizarrón|whiteboard/i, ["whiteboard", "office"]],
  [/tablero\s*de\s*corcho|corkboard/i, ["corkboard", "office"]],
  [/borrador.*pizarr/i, ["whiteboard", "eraser"]],

  // -------- Papelería - accesorios --------
  [/estuche/i, ["pencilcase", "school"]],
  [/mochila|backpack/i, ["backpack", "school"]],
  [/lonchera/i, ["lunchbox", "school"]],
  [/agenda|planner/i, ["planner", "stationery"]],
  [/tabla\s*de\s*apoyo|clipboard/i, ["clipboard"]],
  [/cúter|cutter|utility\s*knife/i, ["utilityknife"]],
  [/diccionario|dictionary/i, ["dictionary", "book"]],
];

const CATEGORY_FALLBACK = {
  1: ["smartphone", "phone"],
  2: ["laptop", "computer"],
  3: ["tablet"],
  4: ["headphones", "audio"],
  5: ["camera"],
  6: ["printer", "office"],
  7: ["monitor", "display"],
  8: ["storage", "computer"],
  9: ["computer", "accessory"],
  10: ["stationery", "school"],
  11: ["office", "furniture"],
};

function tagsFor(product) {
  for (const [re, tags] of TAG_RULES) {
    if (re.test(product.name)) return tags;
  }
  return CATEGORY_FALLBACK[product.categoryId] || ["product"];
}

function imagesForProduct(product) {
  const tags = tagsFor(product);
  const tagStr = tags.join(",");
  return Array.from({ length: 5 }, (_, i) =>
    `https://loremflickr.com/900/900/${encodeURIComponent(tagStr)}?lock=${product.id * 7 + i + 1}`
  );
}

function hasPicsum(p) {
  const cover = (p?.image ?? "") + "";
  if (cover.includes("picsum.photos")) return true;
  if (Array.isArray(p?.images)) {
    return p.images.some((u) => ((u ?? "") + "").includes("picsum.photos"));
  }
  return false;
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

  const targets = products.filter(hasPicsum);
  console.log(`Productos con imágenes picsum (a actualizar): ${targets.length} de ${products.length}`);

  let ok = 0;
  let fail = 0;

  for (const p of targets) {
    const images = imagesForProduct(p);
    const body = {
      name: p.name,
      description: p.description,
      price: Number(p.price),
      stock: Number(p.stock),
      categoryId: Number(p.categoryId),
      image: images[0],
      images,
    };

    try {
      const res = await fetch(`${API_URL}/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const tagPreview = decodeURIComponent(
          images[0].split("/900/")[1].split("?")[0]
        );
        console.log(`OK   id=${p.id}  tags=[${tagPreview}]  ${p.name}`);
        ok++;
      } else {
        const t = await res.text();
        console.error(`FAIL id=${p.id} ${p.name}: ${res.status} ${t}`);
        fail++;
      }
    } catch (e) {
      console.error(`ERR  id=${p.id} ${p.name}:`, e.message);
      fail++;
    }
  }

  console.log("\n---");
  console.log(`Actualizados=${ok}  Fallidos=${fail}`);
}

main();
