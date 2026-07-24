import Decimal from "decimal.js-light";

Decimal.set({
  precision: 40,
  rounding: Decimal.ROUND_HALF_EVEN,
});

export function decimal(value: string): Decimal {
  try {
    return new Decimal(value);
  } catch {
    throw new Error(`Некорректное денежное значение: ${value}`);
  }
}

export function roundMoney(value: Decimal, currency: string): string {
  const fractionDigits = new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).resolvedOptions().maximumFractionDigits;

  return value
    .toDecimalPlaces(fractionDigits, Decimal.ROUND_HALF_EVEN)
    .toFixed(fractionDigits);
}
