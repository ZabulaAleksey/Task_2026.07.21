import type { CurrencyData, FinanceResult } from "../schemas/finance";
import { decimal, roundMoney } from "./money";

export default function calculateFinanceTotal(
  [source1, source2]: FinanceResult,
  currencyData: CurrencyData,
): string {
  const convertToBase = (amount: string, currency: string) => {
    const value = decimal(amount);
    return currency === currencyData.base
      ? value
      : value.dividedBy(decimal(currencyData.rates[currency]));
  };

  const firstTotal = source1.transactions.reduce(
    (total, transaction) => transaction.type === "paid"
      ? total.plus(convertToBase(transaction.amount, transaction.currency))
      : total,
    decimal("0"),
  );
  const secondTotal = source2.reduce(
    (total, payment) => total.plus(convertToBase(payment.amount, payment.currency)),
    decimal("0"),
  );

  return roundMoney(firstTotal.plus(secondTotal), currencyData.base);
}