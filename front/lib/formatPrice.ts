/**
 * Formatea un valor numérico como precio con separador de miles y 2 decimales.
 *   formatPrice(1234.5)   -> "1,234.50"
 *   formatPrice(1234567)  -> "1,234,567.00"
 *   formatPrice(null)     -> "—"
 *
 * Usa locale "en-US" para que el separador de miles sea "," y el decimal ".",
 * que es lo que combina con el símbolo "$" que ya se usa en toda la UI.
 */
const PRICE_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return PRICE_FORMATTER.format(n);
}

/** Igual que formatPrice pero antepone el símbolo "$". */
export function formatPriceWithSymbol(value: unknown): string {
  const formatted = formatPrice(value);
  return formatted === "—" ? "—" : `$${formatted}`;
}
