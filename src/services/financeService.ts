import { getItem } from "../api/getItem";
import { API_URLS } from "../config/api";
import { AppError } from "../errors/AppError";
import {
  currencyDataSchema,
  firstFinanceSourceSchema,
  secondFinanceSourceSchema,
  type FinanceData,
} from "../schemas/finance";

export async function getFinanceData(
  apiKey: string,
  signal?: AbortSignal,
): Promise<FinanceData> {
  const currencyApiKey = import.meta.env.VITE_CURRENCY_API_KEY;
  if (!currencyApiKey) throw new AppError("missingCurrencyApiKey");

  const [firstSource, secondSource, currencyData] = await Promise.all([
    getItem(API_URLS.finance1, firstFinanceSourceSchema, {
      apiKey,
      signal,
      source: "Finance 1",
    }),
    getItem(API_URLS.finance2, secondFinanceSourceSchema, {
      apiKey,
      signal,
      source: "Finance 2",
    }),
    getItem(
      `${API_URLS.currency}${encodeURIComponent(currencyApiKey)}`,
      currencyDataSchema,
      { signal, source: "CurrencyFreaks" },
    ),
  ]);

  const availableCurrencies = new Set([
    currencyData.base,
    ...Object.keys(currencyData.rates),
  ]);
  const usedCurrencies = [
    ...firstSource.transactions
      .filter(({ type }) => type === "paid")
      .map(({ currency }) => currency),
    ...secondSource.map(({ currency }) => currency),
  ];
  const unsupportedCurrency = usedCurrencies.find(
    (currency) => !availableCurrencies.has(currency),
  );

  if (unsupportedCurrency) {
    throw new AppError("missingCurrencyRate", { currency: unsupportedCurrency });
  }

  return {
    financeResult: [firstSource, secondSource],
    currencyData,
  };
}