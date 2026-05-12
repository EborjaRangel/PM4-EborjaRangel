/**
 * Fotos permitidas (`next.config` → images.remotePatterns → images.unsplash.com).
 * Índices asignados por `(categoryId - 1) % length` para nuevas IDs en BD.
 */
const COVER_POOL = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
] as const;

export const LANDING_CATEGORY_COVER_FALLBACK = COVER_POOL[0];

/** Imagen estable para cada `categoryId` (nuevas categorías en BD ciclan sobre el grupo). */
export function landingCategoryCoverImage(categoryId: number): string {
  if (!Number.isFinite(categoryId) || categoryId < 1) {
    return COVER_POOL[0];
  }
  return COVER_POOL[(categoryId - 1) % COVER_POOL.length];
}
