export const CURRENCIES = [
  { code: "INR", symbol: "₹", locale: "en-IN" },
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "EUR", symbol: "€", locale: "en-GB" },
  { code: "GBP", symbol: "£", locale: "en-GB" },
  { code: "JPY", symbol: "¥", locale: "ja-JP" },
] as const;

export function formatMoney(amount: number, currency = "INR") {
  const c = CURRENCIES.find((x) => x.code === currency) ?? CURRENCIES[0];
  try {
    return new Intl.NumberFormat(c.locale, { style: "currency", currency: c.code, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${c.symbol}${Math.round(amount).toLocaleString()}`;
  }
}

export function getCurrencySymbol(currency = "INR") {
  return (CURRENCIES.find((x) => x.code === currency) ?? CURRENCIES[0]).symbol;
}
