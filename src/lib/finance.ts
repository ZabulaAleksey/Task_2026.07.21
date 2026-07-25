import Decimal from "decimal.js-light";
import { z } from "zod";
import type { CurrencyData, FinanceData, FinanceResult } from "./types";

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_EVEN });

export type AppErrorCode =
  | "invalidApiResponse" | "requestFailed" | "missingCurrencyApiKey"
  | "missingCurrencyRate" | "unknownError";

export class AppError extends Error {
  constructor(public code: AppErrorCode, public values: Record<string, string> = {}) {
    super(code);
  }
}

const currencyCode = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/);
const decimalString = z.union([z.string(), z.number().finite()])
  .transform(String).refine((value) => /^-?\d+(?:\.\d+)?$/.test(value));
const firstSchema = z.object({
  transactions: z.array(z.object({
    type: z.enum(["paid", "pending", "rejected"]),
    amount: decimalString,
    currency: currencyCode
  })),
  address: z.object({ city: z.string(), street: z.string(), houseNumber: z.number().finite() })
});
const secondSchema = z.array(z.string()).transform((items, context) => items.map((item) => {
  const match = item.trim().match(/^(-?\d+(?:\.\d+)?)\s+([A-Za-z]{3})$/);
  if (!match) {
    context.addIssue({ code: "custom", message: `Invalid payment: ${item}` });
    return { amount: "0", currency: "USD" };
  }
  return { amount: match[1], currency: match[2].toUpperCase() };
}));
const currencySchema = z.object({
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)))
    .transform((value) => new Date(value).toISOString().slice(0, 10)),
  base: currencyCode,
  rates: z.record(
    z.string().trim().toUpperCase().regex(/^[A-Z0-9.$_-]{1,30}$/),
    decimalString.refine((value) => Number(value) > 0)
  )
});

async function request<T>(
  url: string, schema: z.ZodType<T>, options: { apiKey?: string; signal?: AbortSignal; source: string }
) {
  const headers: HeadersInit = { Accept: "application/json" };
  if (options.apiKey) headers["x-api-key"] = options.apiKey;
  const response = await fetch(url, { headers, signal: options.signal });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new AppError("requestFailed", { source: options.source, status: String(response.status) });
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new AppError("invalidApiResponse", { source: options.source });
  return parsed.data;
}

export async function getFinanceData(apiKey: string, signal?: AbortSignal): Promise<FinanceData> {
  const currencyApiKey = import.meta.env.VITE_CURRENCY_API_KEY;
  if (!currencyApiKey) throw new AppError("missingCurrencyApiKey");
  const [first, second, currencies] = await Promise.all([
    request("https://cpa-server-vtel.onrender.com/api/finance1", firstSchema,
      { apiKey, signal, source: "Finance 1" }),
    request("https://cpa-server-vtel.onrender.com/api/finance2", secondSchema,
      { apiKey, signal, source: "Finance 2" }),
    request(`https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${encodeURIComponent(currencyApiKey)}`,
      currencySchema, { signal, source: "CurrencyFreaks" })
  ]);
  const available = new Set([currencies.base, ...Object.keys(currencies.rates)]);
  const used = [
    ...first.transactions.filter((item) => item.type === "paid").map((item) => item.currency),
    ...second.map((item) => item.currency)
  ];
  const missing = used.find((currency) => !available.has(currency));
  if (missing) throw new AppError("missingCurrencyRate", { currency: missing });
  return { financeResult: [first, second], currencyData: currencies };
}

const decimal = (value: string) => new Decimal(value);

export function currencyTotals([first, second]: FinanceResult) {
  const totals = new Map<string, Decimal>();
  const add = (amount: string, currency: string) =>
    totals.set(currency, (totals.get(currency) ?? decimal("0")).plus(decimal(amount)));
  first.transactions.forEach((item) => { if (item.type === "paid") add(item.amount, item.currency); });
  second.forEach((item) => add(item.amount, item.currency));
  return [...totals].map(([currency, amount]) => ({ currency, amount: amount.toString() }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

export function financeTotal([first, second]: FinanceResult, currencies: CurrencyData) {
  const convert = (amount: string, currency: string) =>
    currency === currencies.base ? decimal(amount) : decimal(amount).dividedBy(decimal(currencies.rates[currency]));
  let total = decimal("0");
  first.transactions.forEach((item) => {
    if (item.type === "paid") total = total.plus(convert(item.amount, item.currency));
  });
  second.forEach((item) => { total = total.plus(convert(item.amount, item.currency)); });
  const digits = new Intl.NumberFormat("en", { style: "currency", currency: currencies.base })
    .resolvedOptions().maximumFractionDigits;
  return total.toDecimalPlaces(digits, Decimal.ROUND_HALF_EVEN).toFixed(digits);
}
