/* eslint-disable no-console */
/**
 * Da de alta 100 productos extra en la categoría "Papeleria".
 *
 * Uso:
 *   node back/scripts/seed-papeleria-100.js
 *
 * Requisitos:
 *   - Backend corriendo en http://localhost:3000
 *   - Categoría "Papeleria" (id = 10) preloaded en Postgres.
 *
 * Cada producto trae 5 imágenes determinísticas basadas en el nombre de la
 * categoría y del producto (URLs de picsum.photos que siempre cargan).
 * El script es idempotente: si un producto con el mismo nombre ya existe,
 * lo omite.
 */

const API_URL = process.env.API_URL || "http://localhost:3000";
const CATEGORY_NAME = "Papeleria";
const CATEGORY_ID = 10;

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function imagesFor(category, name, count = 5) {
  const cat = slugify(category);
  const prod = slugify(name);
  return Array.from(
    { length: count },
    (_, i) =>
      `https://picsum.photos/seed/pulse-${cat}-${prod}-${i + 1}/900/900`
  );
}

const PRODUCTS = [
  // Lápices de grafito
  { name: "Lápiz Mirado HB caja con 12 piezas", description: "Caja con 12 lápices Berol Mirado #2 HB con punta resistente y borrador integrado.", price: 79, stock: 60 },
  { name: "Lápiz Mirado 2B caja con 12 piezas", description: "Lápices Berol Mirado 2B para dibujo y trazo suave, 12 piezas con goma.", price: 89, stock: 55 },
  { name: "Lápiz Berol Mirado #2 individual", description: "Lápiz clásico Berol Mirado #2 HB, ideal para examenes y oficina.", price: 9, stock: 200 },
  { name: "Lápiz Faber-Castell Grip 2001 HB", description: "Lápiz triangular ergonómico con puntos antideslizantes para mejor agarre.", price: 19, stock: 120 },
  { name: "Lápiz Staedtler Wopex Norica HB", description: "Lápiz Staedtler Norica HB de larga duración, hecho de material reciclable.", price: 15, stock: 150 },
  { name: "Lápiz bicolor Berol Verithin rojo y azul", description: "Lápiz bicolor profesional para revisión y subrayado, mina resistente.", price: 22, stock: 90 },
  { name: "Pack 6 lápices Steno Eagle #2 HB", description: "Pack de 6 lápices preescolares Eagle Steno con goma, mina resistente.", price: 49, stock: 75 },
  { name: "Portaminas Pentel P207 0.7mm", description: "Portaminas profesional Pentel P207 con punta retráctil y clip de metal.", price: 89, stock: 50 },
  { name: "Portaminas Pilot Super Grip 0.5mm", description: "Portaminas Pilot Super Grip con grip de hule antideslizante.", price: 75, stock: 45 },
  { name: "Caja de minas Pentel 0.7mm HB 12 pzs", description: "Repuesto de minas Pentel 0.7mm HB, presentación con 12 minas.", price: 25, stock: 80 },

  // Lápices de colores y crayones
  { name: "Caja 12 lápices de colores Faber-Castell", description: "Lápices de colores escolares Faber-Castell con minas no tóxicas.", price: 129, stock: 70 },
  { name: "Caja 24 lápices de colores Faber-Castell", description: "Set escolar con 24 colores brillantes Faber-Castell, fáciles de afilar.", price: 229, stock: 55 },
  { name: "Caja 36 lápices de colores Faber-Castell", description: "Estuche con 36 lápices de colores Faber-Castell, ideal para arte escolar.", price: 339, stock: 40 },
  { name: "Caja 48 lápices de colores Faber-Castell", description: "Set premium con 48 lápices Faber-Castell de pigmentación intensa.", price: 489, stock: 25 },
  { name: "Lápices Prismacolor Premier 12 colores", description: "Estuche profesional Prismacolor Premier con 12 lápices de colores artísticos.", price: 459, stock: 30 },
  { name: "Lápices Prismacolor Premier 24 colores", description: "Set artístico Prismacolor Premier con 24 lápices de mina suave y cremosa.", price: 849, stock: 18 },
  { name: "Lápices Prismacolor Premier 48 colores", description: "Estuche premium Prismacolor Premier con 48 colores para ilustración profesional.", price: 1599, stock: 10 },
  { name: "Crayolas Crayola caja con 12 colores", description: "Caja de 12 crayones Crayola clásicos no tóxicos.", price: 49, stock: 90 },
  { name: "Crayolas Crayola caja con 24 colores", description: "Caja de 24 crayones Crayola estándar, colores vivos.", price: 79, stock: 75 },
  { name: "Crayolas Crayola Largos 12 piezas", description: "Crayones largos Crayola para colorear áreas grandes, 12 piezas.", price: 99, stock: 60 },

  // Marcadores y plumones
  { name: "Marcadores Crayola lavables 12 pzs", description: "Marcadores Crayola escolares lavables, 12 colores brillantes.", price: 99, stock: 80 },
  { name: "Marcadores Crayola Super Tips 20 colores", description: "Set Crayola Super Tips con 20 marcadores que cambian de punta fina a gruesa.", price: 199, stock: 60 },
  { name: "Marcadores Crayola Super Tips 50 colores", description: "Estuche con 50 marcadores Crayola Super Tips para arte y lettering.", price: 449, stock: 30 },
  { name: "Plumones Magicolor Pelikan 12 colores", description: "Plumones escolares Pelikan Magicolor de punta fina, lavables.", price: 79, stock: 90 },
  { name: "Plumones Magicolor Pelikan 24 colores", description: "Set con 24 plumones Pelikan, ideales para tareas y dibujo.", price: 149, stock: 60 },
  { name: "Plumones Sharpie punta fina 5 colores", description: "Marcadores permanentes Sharpie de punta fina, set de 5 colores básicos.", price: 159, stock: 70 },
  { name: "Plumón Sharpie negro punta cincel", description: "Sharpie permanente individual punta cincel para superficies múltiples.", price: 49, stock: 100 },
  { name: "Plumones acuarelables Tombow Dual Brush 10", description: "Set de 10 plumones Tombow Dual Brush con punta de pincel y punta fina, ideal lettering.", price: 459, stock: 30 },

  // Resaltadores y otros marcadores
  { name: "Resaltadores Stabilo Boss 4 colores", description: "Resaltadores Stabilo Boss Original con tinta antiseca de larga duración, 4 colores.", price: 119, stock: 80 },
  { name: "Resaltadores Stabilo Boss Pastel 6 colores", description: "Set Stabilo Boss tonos pastel para subrayar estética y suave.", price: 179, stock: 60 },
  { name: "Resaltadores BIC Brite Liner 5 colores", description: "Resaltadores BIC Brite Liner punta cincel, set con 5 colores neón.", price: 79, stock: 90 },
  { name: "Marcador para pizarrón Expo 4 colores", description: "Marcadores Expo de borrado en seco, set con 4 colores y tinta low-odor.", price: 149, stock: 70 },

  // Plumas / bolígrafos
  { name: "Pluma BIC Cristal azul caja con 12", description: "Caja con 12 bolígrafos BIC Cristal punto medio tinta azul.", price: 79, stock: 200 },
  { name: "Pluma BIC Cristal negra caja con 12", description: "Bolígrafos BIC Cristal punto medio tinta negra, 12 piezas.", price: 79, stock: 200 },
  { name: "Pluma BIC Cristal roja caja con 12", description: "Bolígrafos BIC Cristal punto medio tinta roja, 12 piezas.", price: 79, stock: 180 },
  { name: "Pluma Pilot G2 0.7 azul 4 piezas", description: "Pack de 4 plumas Pilot G2 0.7 gel azul, recargable y de tinta suave.", price: 169, stock: 80 },
  { name: "Pluma Pilot G2 0.5 negra 4 piezas", description: "Pack de 4 plumas Pilot G2 0.5 gel negra, trazo fino y nítido.", price: 169, stock: 70 },
  { name: "Pluma Pilot Frixion borrable azul 3 pzs", description: "Pack con 3 plumas Pilot Frixion borrables por fricción tinta azul.", price: 169, stock: 90 },
  { name: "Pluma fuente Pilot Metropolitan", description: "Pluma fuente Pilot Metropolitan punta media, cuerpo metálico con estuche.", price: 549, stock: 25 },
  { name: "Estilógrafos Staedtler Pigment Liner set 4", description: "Set con 4 estilógrafos Staedtler Pigment Liner negros 0.1/0.3/0.5/0.7.", price: 269, stock: 40 },

  // Cuadernos y blocks
  { name: "Cuaderno profesional 100 hojas rayado", description: "Cuaderno tamaño profesional 100 hojas raya, pasta gruesa.", price: 49, stock: 120 },
  { name: "Cuaderno profesional 100 hojas cuadro chico", description: "Cuaderno tamaño profesional 100 hojas cuadro 5mm, pasta gruesa.", price: 49, stock: 120 },
  { name: "Cuaderno profesional 200 hojas pasta dura", description: "Cuaderno profesional 200 hojas raya pasta dura cosido y engomado.", price: 119, stock: 60 },
  { name: "Cuaderno francés 100 hojas cuadro grande", description: "Cuaderno tamaño francés 100 hojas cuadro grande, pasta flexible.", price: 39, stock: 110 },
  { name: "Cuaderno Scribe profesional cosido 100", description: "Cuaderno Scribe profesional cosido con 100 hojas raya, pasta gruesa.", price: 65, stock: 80 },
  { name: "Block de dibujo Arches A4 20 hojas", description: "Block de dibujo profesional Arches papel grueso para acuarela A4.", price: 219, stock: 25 },
  { name: "Block de cartulinas opalina A4 25 hojas", description: "Block tamaño A4 con 25 hojas de cartulina opalina blanca 220 g.", price: 99, stock: 50 },
  { name: "Block tamaño carta blanco 50 hojas", description: "Block engomado tamaño carta con 50 hojas blancas para apuntes.", price: 45, stock: 90 },

  // Papel y hojas
  { name: "Paquete 500 hojas tamaño carta Scribe", description: "Paquete con 500 hojas tamaño carta Scribe Eco 75 g/m², blancura ISO 95.", price: 129, stock: 70 },
  { name: "Paquete 500 hojas tamaño oficio Scribe", description: "Paquete con 500 hojas tamaño oficio Scribe Eco 75 g/m².", price: 159, stock: 55 },
  { name: "Paquete 100 hojas papel bond A4 75gr", description: "Paquete con 100 hojas papel bond A4 75 g/m² blancura ISO 92.", price: 49, stock: 100 },
  { name: "Cartulina opalina blanca pliego 10 pzs", description: "Pliegos de cartulina opalina blanca 220g, paquete con 10 piezas.", price: 119, stock: 40 },
  { name: "Cartulina iris colores pliego 10 pzs", description: "Cartulinas iris colores surtidos en pliego, paquete con 10 piezas.", price: 99, stock: 45 },
  { name: "Foamy escarchado colores 10 pliegos", description: "Foamy con escarcha en colores surtidos, paquete con 10 pliegos.", price: 89, stock: 50 },

  // Archivo / carpetas
  { name: "Folder manila tamaño carta paquete 25", description: "Paquete con 25 folders manila tamaño carta con ceja superior.", price: 89, stock: 60 },
  { name: "Folder colgante tamaño carta 25 pzs", description: "Folders colgantes tamaño carta con etiquetas, 25 piezas.", price: 249, stock: 35 },
  { name: "Carpeta 3 argollas 1.5\" tamaño carta", description: "Carpeta de 3 argollas 1.5 pulgadas con cubierta plástica.", price: 99, stock: 70 },
  { name: "Carpeta 3 argollas 2\" tamaño carta", description: "Carpeta de 3 argollas 2 pulgadas, cubierta plástica reforzada.", price: 119, stock: 60 },
  { name: "Carpeta Lefort palanca tamaño carta", description: "Carpeta Lefort palanca tamaño carta para archivo de oficina.", price: 149, stock: 40 },
  { name: "Sobre manila tamaño carta paquete 25", description: "Paquete con 25 sobres manila tamaño carta para documentos.", price: 99, stock: 60 },

  // Pegamentos y cintas
  { name: "Pegamento Resistol blanco 250g", description: "Pegamento Resistol blanco escolar 250g, lavable y atóxico.", price: 49, stock: 100 },
  { name: "Pegamento Pritt barra adhesiva 21g", description: "Pegamento en barra Pritt 21g, lavable y de fácil aplicación.", price: 39, stock: 120 },
  { name: "Pegamento UHU barra adhesiva 8.2g", description: "Pegamento en barra UHU 8.2g, atóxico, ideal para uso escolar.", price: 25, stock: 130 },
  { name: "Cinta Scotch transparente 18mm con dispensador", description: "Cinta adhesiva Scotch Magic 18mm x 33m con dispensador.", price: 79, stock: 80 },
  { name: "Cinta canela 48mm Tuk", description: "Cinta canela Tuk de 48mm x 50m para empaque y embalaje.", price: 39, stock: 100 },
  { name: "Cinta masking tape 24mm", description: "Cinta masking tape 24mm x 50m para pintura y manualidades.", price: 35, stock: 110 },
  { name: "Corrector líquido Bic Wite-Out 20ml", description: "Corrector líquido Bic Wite-Out con brocha, 20ml.", price: 39, stock: 100 },
  { name: "Diurex transparente 12mm Tuk", description: "Cinta Diurex transparente 12mm x 33m para uso escolar.", price: 19, stock: 150 },

  // Cortar / medir
  { name: "Tijeras escolares Maped Essentials 13cm", description: "Tijeras escolares Maped Essentials 13cm punta redonda.", price: 49, stock: 110 },
  { name: "Tijeras profesionales Barrilito 21cm", description: "Tijeras profesionales Barrilito 21cm acero inoxidable para oficina.", price: 89, stock: 80 },
  { name: "Sacapuntas Maped con depósito", description: "Sacapuntas Maped con depósito y dos orificios para lápiz estándar y jumbo.", price: 35, stock: 130 },
  { name: "Sacapuntas eléctrico USB", description: "Sacapuntas eléctrico con recarga USB y depósito transparente.", price: 199, stock: 40 },
  { name: "Goma de borrar Mars Plastic Staedtler 4 pzs", description: "Pack de 4 gomas de borrar Mars Plastic Staedtler blanca premium.", price: 49, stock: 110 },
  { name: "Goma de borrar Factis P-30 8 pzs", description: "Pack de 8 gomas Factis P-30 para lápiz, atóxicas y libres de PVC.", price: 39, stock: 120 },

  // Geometría / matemáticas
  { name: "Regla Maped 30cm transparente", description: "Regla Maped 30cm de plástico transparente con tope de protección.", price: 19, stock: 200 },
  { name: "Regla Maped 20cm flexible", description: "Regla Maped 20cm flexible y transparente, ideal escolar.", price: 15, stock: 180 },
  { name: "Juego geométrico Maped 4 piezas", description: "Juego geométrico Maped con regla 30cm, transportador y dos escuadras.", price: 89, stock: 70 },
  { name: "Compás Maped Stop System", description: "Compás escolar Maped Stop System con porta lápiz y caja protectora.", price: 79, stock: 80 },
  { name: "Transportador Maped 180° 12cm", description: "Transportador Maped 180 grados de 12 cm, transparente.", price: 25, stock: 120 },
  { name: "Calculadora Casio fx-82MS científica", description: "Calculadora científica Casio fx-82MS con 240 funciones.", price: 269, stock: 50 },

  // Engrapado / perforado / clips
  { name: "Engrapadora Acme media tira estándar", description: "Engrapadora Acme tipo media tira estándar negra para 20 hojas.", price: 99, stock: 70 },
  { name: "Engrapadora industrial Swingline", description: "Engrapadora industrial Swingline para alto volumen, hasta 100 hojas.", price: 549, stock: 20 },
  { name: "Caja grapas estándar 5000 piezas", description: "Caja con 5000 grapas estándar 26/6 galvanizadas.", price: 49, stock: 100 },
  { name: "Sacagrapas Acme", description: "Sacagrapas estándar Acme metálico con punta retráctil.", price: 19, stock: 150 },
  { name: "Perforadora 2 orificios Acme", description: "Perforadora Acme de 2 orificios, capacidad 10 hojas, base con regla.", price: 89, stock: 60 },
  { name: "Perforadora industrial 3 orificios", description: "Perforadora industrial 3 orificios, capacidad de 30 hojas.", price: 499, stock: 25 },
  { name: "Clips estándar No. 1 caja 100", description: "Caja con 100 clips estándar No.1 niquelados.", price: 19, stock: 200 },
  { name: "Clips mariposa caja 50", description: "Caja con 50 clips mariposa pequeños niquelados.", price: 25, stock: 180 },
  { name: "Pinzas binder 50mm caja 12", description: "Caja con 12 pinzas binder negras de 50 mm para sujetar mucha hoja.", price: 49, stock: 90 },

  // Post-it / etiquetas / pizarras
  { name: "Notas adhesivas Post-it 76x76 amarillas", description: "Bloque de notas adhesivas Post-it 76x76mm color amarillo, 100 hojas.", price: 35, stock: 130 },
  { name: "Notas adhesivas Post-it 76x127 surtidas", description: "Notas adhesivas Post-it 76x127mm colores surtidos, 100 hojas por color.", price: 119, stock: 70 },
  { name: "Banderitas adhesivas Post-it 5 colores", description: "Set Post-it Flags con 5 colores y 100 banderitas por color.", price: 99, stock: 85 },
  { name: "Etiquetas adhesivas blancas Janel 100", description: "Etiquetas adhesivas blancas Janel para escritura manual, 100 pzs.", price: 25, stock: 160 },
  { name: "Pizarrón blanco 60x90 magnético", description: "Pizarrón blanco magnético 60x90 cm con marco de aluminio.", price: 549, stock: 20 },
  { name: "Borrador para pizarrón blanco con imán", description: "Borrador para pizarrón blanco con imán incorporado.", price: 49, stock: 100 },

  // Otros / accesorios escolares
  { name: "Estuche escolar 3 compartimentos", description: "Estuche escolar de tela con 3 compartimentos y cierre reforzado.", price: 119, stock: 60 },
  { name: "Mochila escolar grande 18 pulgadas", description: "Mochila escolar de 18 pulgadas con compartimento para laptop y bolsillos laterales.", price: 549, stock: 35 },
  { name: "Agenda escolar 2026 tamaño A5", description: "Agenda 2026 tamaño A5 con vista semanal, sección de notas y stickers.", price: 199, stock: 55 },
  { name: "Tabla de apoyo tamaño carta con clip", description: "Tabla de apoyo (clipboard) tamaño carta con clip metálico.", price: 49, stock: 80 },
  { name: "Cúter profesional 18mm con cuchillas", description: "Cúter profesional 18mm con repuesto de 5 cuchillas extra.", price: 49, stock: 90 },
];

async function getExistingNames() {
  try {
    const r = await fetch(`${API_URL}/products`);
    if (!r.ok) return new Set();
    const list = await r.json();
    return new Set(
      (Array.isArray(list) ? list : []).map((p) =>
        (p?.name ?? "").toString().trim().toLowerCase()
      )
    );
  } catch {
    return new Set();
  }
}

async function main() {
  console.log(`Total a crear: ${PRODUCTS.length} productos en "${CATEGORY_NAME}".`);
  if (PRODUCTS.length !== 100) {
    console.warn(`Advertencia: la lista tiene ${PRODUCTS.length} productos (esperaba 100).`);
  }

  const existing = await getExistingNames();
  let ok = 0;
  let skipped = 0;
  let fail = 0;

  for (const p of PRODUCTS) {
    if (existing.has(p.name.trim().toLowerCase())) {
      console.log(`SKIP  (ya existe) ${p.name}`);
      skipped++;
      continue;
    }

    const images = imagesFor(CATEGORY_NAME, p.name, 5);
    const body = {
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      categoryId: CATEGORY_ID,
      image: images[0],
      images,
    };

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Pulse-Product-Op": "create",
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = await res.json();
        console.log(`OK    id=${json.id}  ${p.name}`);
        ok++;
      } else {
        const text = await res.text();
        console.error(`FAIL  ${p.name}: ${res.status} ${text}`);
        fail++;
      }
    } catch (e) {
      console.error(`ERR   ${p.name}:`, e.message);
      fail++;
    }
  }

  console.log("\n---");
  console.log(`Listo. Creados=${ok}  Omitidos=${skipped}  Fallidos=${fail}`);
}

main();
