export const PRODUCT_CATEGORIES: { id: number; name: string }[] = [
  { id: 1, name: "Smartphones y móviles" },
  { id: 2, name: "Computadoras y laptops" },
  { id: 3, name: "Tablets y accesorios" },
  { id: 4, name: "Audio y video" },
  { id: 5, name: "Wearables y hogar" },
  { id: 6, name: "Gaming y periféricos" },
];

export function categoryLabel(categoryId: number): string {
  return PRODUCT_CATEGORIES.find((c) => c.id === categoryId)?.name ?? `Categoría ${categoryId}`;
}
