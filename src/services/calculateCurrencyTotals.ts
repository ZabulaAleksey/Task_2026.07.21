import type { FinanceResult } from "../schemas/finance";
import { decimal } from "./money";

export type CurrencyTotal = { currency: string; amount: string };

export default function calculateCurrencyTotals([source1, source2]: FinanceResult): CurrencyTotal[] {
  const totals = new Map<string, string>();
  const addAmount = (amount: string, currency: string) => {
    totals.set(currency, decimal(totals.get(currency) ?? "0").plus(decimal(amount)).toString());
  };

  source1.transactions.forEach((transaction) => {
    if (transaction.type === "paid") addAmount(transaction.amount, transaction.currency);
  });
  source2.forEach(({ amount, currency }) => addAmount(amount, currency));

  return [...totals]
    .map(([currency, amount]) => ({ currency, amount }))
    .sort((left, right) => left.currency.localeCompare(right.currency));
}