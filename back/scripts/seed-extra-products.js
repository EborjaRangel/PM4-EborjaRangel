/* eslint-disable no-console */
/**
 * Da de alta productos demo en la API local de PULSE.
 *
 * Uso:
 *   node back/scripts/seed-extra-products.js
 *
 * Requisitos:
 *   - Backend corriendo en http://localhost:3000 (npm run dev en /back)
 *   - Las categorías ya están preloaded en PostgreSQL.
 *
 * Cada producto se crea con 5 imágenes basadas en el nombre de la categoría
 * (URLs deterministas de picsum.photos -> siempre cargan).
 */

const API_URL = process.env.API_URL || "http://localhost:3000";

const CATEGORIES = {
  Smartphones: 1,
  Laptops: 2,
  Tablets: 3,
  Headphones: 4,
  Cameras: 5,
  Printers: 6,
  Monitors: 7,
  Storage: 8,
  Accessories: 9,
  Papeleria: 10,
  Oficina: 11,
};

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
  // ---------------- Smartphones ----------------
  {
    category: "Smartphones",
    name: "iPhone 15 Pro Max 256GB",
    description:
      "Apple iPhone 15 Pro Max con chip A17 Pro, cámara de 48MP, pantalla Super Retina XDR de 6.7 pulgadas y cuerpo de titanio aeroespacial. Incluye USB-C y Dynamic Island.",
    price: 28999,
    stock: 12,
  },
  {
    category: "Smartphones",
    name: "Samsung Galaxy S24 Ultra 512GB",
    description:
      "Galaxy S24 Ultra con S Pen integrado, cámara principal de 200MP, Snapdragon 8 Gen 3 for Galaxy y pantalla Dynamic AMOLED 2X de 6.8 pulgadas.",
    price: 26499,
    stock: 14,
  },
  {
    category: "Smartphones",
    name: "Google Pixel 9 Pro 256GB",
    description:
      "Pixel 9 Pro con Google Tensor G4, Gemini AI integrado, triple cámara con zoom telefoto 5x y 7 años de actualizaciones garantizadas.",
    price: 21999,
    stock: 10,
  },

  // ---------------- Laptops ----------------
  {
    category: "Laptops",
    name: "MacBook Pro 14\" M3 Pro 18GB/512GB",
    description:
      "MacBook Pro 14 con chip M3 Pro, 18GB de RAM unificada, 512GB SSD, pantalla Liquid Retina XDR y hasta 22 horas de batería.",
    price: 39999,
    stock: 8,
  },
  {
    category: "Laptops",
    name: "Dell XPS 15 OLED i7 RTX 4060",
    description:
      "Dell XPS 15 con Intel Core i7-13700H, 16GB RAM DDR5, 1TB SSD, GPU NVIDIA RTX 4060 y pantalla OLED 3.5K touch.",
    price: 31499,
    stock: 7,
  },
  {
    category: "Laptops",
    name: "Lenovo ThinkPad X1 Carbon Gen 11",
    description:
      "Ultrabook empresarial con Intel Core Ultra 7, 16GB LPDDR5x, 1TB SSD, certificación MIL-SPEC y pantalla 14\" 2.8K OLED.",
    price: 28999,
    stock: 6,
  },

  // ---------------- Tablets ----------------
  {
    category: "Tablets",
    name: "iPad Pro 13\" M4 Wi-Fi 256GB",
    description:
      "iPad Pro 13 con chip M4, pantalla Ultra Retina XDR (tándem OLED), compatibilidad con Apple Pencil Pro y Magic Keyboard.",
    price: 27499,
    stock: 9,
  },
  {
    category: "Tablets",
    name: "Samsung Galaxy Tab S9 FE+ 12.4\"",
    description:
      "Tablet Samsung con pantalla 12.4 WQXGA 90Hz, S Pen incluido, resistencia al agua IP68 y 8GB de RAM.",
    price: 12999,
    stock: 11,
  },
  {
    category: "Tablets",
    name: "Lenovo Tab P12 Pro 12.7\" 256GB",
    description:
      "Tableta premium con MediaTek Dimensity 7050, pantalla 12.7 3K 120Hz, sonido Dolby Atmos y lápiz Tab Pen Plus incluido.",
    price: 9999,
    stock: 8,
  },

  // ---------------- Headphones ----------------
  {
    category: "Headphones",
    name: "Sony WH-1000XM5",
    description:
      "Audífonos inalámbricos over-ear con cancelación de ruido líder en la industria, hasta 30 horas de batería y carga rápida USB-C.",
    price: 6999,
    stock: 18,
  },
  {
    category: "Headphones",
    name: "Bose QuietComfort Ultra",
    description:
      "Sonido espacial inmersivo, cancelación activa de ruido y micrófonos para llamadas claras incluso con viento o ruido ambiental.",
    price: 7499,
    stock: 12,
  },
  {
    category: "Headphones",
    name: "Apple AirPods Max",
    description:
      "Audífonos over-ear con audio Hi-Fi, audio espacial, chip H1, copas de aluminio anodizado y cancelación activa de ruido.",
    price: 11999,
    stock: 7,
  },

  // ---------------- Cameras ----------------
  {
    category: "Cameras",
    name: "Sony Alpha A7 IV (cuerpo)",
    description:
      "Cámara mirrorless full-frame de 33MP, video 4K 60p 10-bit 4:2:2 y autofoco en tiempo real con inteligencia artificial.",
    price: 49999,
    stock: 4,
  },
  {
    category: "Cameras",
    name: "Canon EOS R6 Mark II + RF 24-105mm",
    description:
      "Mirrorless full-frame de 24.2MP, ráfaga de hasta 40 fps, video 4K 60p sin recorte y estabilización de 8 pasos.",
    price: 56999,
    stock: 3,
  },
  {
    category: "Cameras",
    name: "GoPro HERO12 Black",
    description:
      "Cámara de acción 5.3K60, HyperSmooth 6.0, modo HDR, soporte a Bluetooth audio y batería Enduro de larga duración.",
    price: 8999,
    stock: 15,
  },

  // ---------------- Printers ----------------
  {
    category: "Printers",
    name: "HP LaserJet Pro M404dw",
    description:
      "Impresora láser monocromática Wi-Fi con dúplex automático, ethernet, USB y velocidad de hasta 38 ppm.",
    price: 4999,
    stock: 10,
  },
  {
    category: "Printers",
    name: "Epson EcoTank L3250 Multifuncional",
    description:
      "Multifuncional con sistema de tanques de tinta, escáner CIS, copia, impresión inalámbrica y muy bajo costo por página.",
    price: 4499,
    stock: 14,
  },
  {
    category: "Printers",
    name: "Brother MFC-L2750DW",
    description:
      "Multifuncional láser monocromática con alimentador automático dúplex, fax, ethernet y Wi-Fi Direct.",
    price: 6999,
    stock: 8,
  },

  // ---------------- Monitors ----------------
  {
    category: "Monitors",
    name: "LG UltraGear 27GP850 QHD 165Hz",
    description:
      "Monitor gaming IPS de 27 pulgadas 2560x1440, 165Hz (OC 180Hz), 1ms, HDR10 y compatible con NVIDIA G-SYNC y AMD FreeSync Premium.",
    price: 7999,
    stock: 9,
  },
  {
    category: "Monitors",
    name: "Samsung Odyssey G7 32\" 1000R",
    description:
      "Monitor curvo VA QHD 240Hz, 1ms, soporte HDR600, sincronización G-SYNC compatible y diseño Infinity Core con LED RGB.",
    price: 11499,
    stock: 6,
  },
  {
    category: "Monitors",
    name: "Dell UltraSharp U2723QE 27\" 4K",
    description:
      "Monitor profesional IPS Black 4K UHD, USB-C 90W, KVM integrado, cobertura sRGB 100% y certificación Calman.",
    price: 12999,
    stock: 5,
  },

  // ---------------- Storage ----------------
  {
    category: "Storage",
    name: "Samsung T7 Shield 2TB USB-C",
    description:
      "SSD portátil rugged USB 3.2 Gen 2, hasta 1050MB/s lectura, IP65, encriptación AES-256 y resistencia a caídas de 3m.",
    price: 3299,
    stock: 22,
  },
  {
    category: "Storage",
    name: "WD Black SN850X 2TB NVMe Gen4",
    description:
      "SSD interno M.2 2280 NVMe PCIe Gen4 con hasta 7300MB/s de lectura, optimizado para gaming y para creadores de contenido.",
    price: 3899,
    stock: 16,
  },
  {
    category: "Storage",
    name: "SanDisk Extreme Pro 256GB SDXC UHS-II",
    description:
      "Tarjeta SDXC UHS-II clase 10 V90 con velocidades de hasta 300MB/s, ideal para video 4K/8K y ráfagas RAW.",
    price: 1599,
    stock: 28,
  },

  // ---------------- Accessories ----------------
  {
    category: "Accessories",
    name: "Logitech MX Master 3S",
    description:
      "Mouse inalámbrico ergonómico con sensor de 8000 DPI, scroll MagSpeed silencioso, multidevice y carga USB-C.",
    price: 1999,
    stock: 25,
  },
  {
    category: "Accessories",
    name: "Keychron K8 Pro (QMK/VIA)",
    description:
      "Teclado mecánico inalámbrico TKL, hot-swap, switches Gateron Pro Brown, retroiluminación RGB y compatible con macOS/Windows.",
    price: 2899,
    stock: 18,
  },
  {
    category: "Accessories",
    name: "Anker 555 USB-C Hub 8-en-1",
    description:
      "Hub con HDMI 4K@60Hz, Power Delivery 100W, 2 USB-A 10Gbps, lector SD/microSD UHS-II y Ethernet Gigabit.",
    price: 1499,
    stock: 30,
  },

  // ---------------- Papeleria ----------------
  {
    category: "Papeleria",
    name: "Cuaderno Moleskine Classic A5",
    description:
      "Cuaderno Moleskine A5 con tapa dura, 240 páginas en papel marfil sin ácido, banda elástica y bolsillo interior expansible.",
    price: 459,
    stock: 35,
  },
  {
    category: "Papeleria",
    name: "Set Plumones Sharpie 24 colores",
    description:
      "Estuche con 24 marcadores permanentes Sharpie de doble punta (fina y ultrafina) para arte, oficina y arte urbano.",
    price: 549,
    stock: 40,
  },
  {
    category: "Papeleria",
    name: "Calculadora Casio FX-991ES Plus",
    description:
      "Calculadora científica con 417 funciones, escritura natural V.P.A.M., resolución de ecuaciones e ideal para ingenierías.",
    price: 389,
    stock: 50,
  },

  // ---------------- Oficina ----------------
  {
    category: "Oficina",
    name: "Silla ergonómica reclinable con malla",
    description:
      "Silla de oficina con soporte lumbar ajustable, descansabrazos 3D, respaldo de malla transpirable y reclinable hasta 135°.",
    price: 3299,
    stock: 12,
  },
  {
    category: "Oficina",
    name: "Escritorio Standing Desk 120x60",
    description:
      "Escritorio ajustable eléctrico con memoria para 4 alturas, capacidad de carga 80kg, velocidad de 25mm/s y motor silencioso.",
    price: 6499,
    stock: 6,
  },
  {
    category: "Oficina",
    name: "Lámpara LED de escritorio touch USB-C",
    description:
      "Lámpara con 3 modos de luz (cálida, neutra, fría), 10 niveles de intensidad, brazo articulado y puerto USB-C de carga.",
    price: 599,
    stock: 22,
  },
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
  const existing = await getExistingNames();
  let ok = 0;
  let skipped = 0;
  let fail = 0;

  for (const p of PRODUCTS) {
    const categoryId = CATEGORIES[p.category];
    if (!categoryId) {
      console.error("Categoría desconocida:", p.category);
      fail++;
      continue;
    }
    if (existing.has(p.name.trim().toLowerCase())) {
      console.log(`SKIP  (ya existe) ${p.name}`);
      skipped++;
      continue;
    }

    const images = imagesFor(p.category, p.name, 5);
    const body = {
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      categoryId,
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
        console.log(`OK    id=${json.id}  [${p.category}]  ${p.name}`);
        ok++;
      } else {
        const text = await res.text();
        console.error(`FAIL  [${p.category}] ${p.name}: ${res.status} ${text}`);
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
