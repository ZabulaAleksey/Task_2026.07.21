import type { FinanceResult } from "../types/finance";
import type { CurrencyData } from "../types/finance";

export default function calculateFinanceTotal(
  [source1, source2]: FinanceResult,
  currencyData: CurrencyData
): number | null {
  const convertToBase = (
    amount: number,
    currency: string,
  ): number => {
    const normalizedCurrency = currency.toUpperCase();

    if (normalizedCurrency === currencyData.base) {
      return amount;
    }

    const rate = Number(currencyData.rates[normalizedCurrency]);

    if (!Number.isFinite(rate) || rate === 0) {
      throw new Error(
        `Не найден курс для валюты ${normalizedCurrency}`,
      );
    }

    return amount / rate;
  };

  const firstSourceTotal = (source1 ? source1.transactions.reduce(
    (total, transaction) => {
      if (transaction.type !== "paid") {
        return total;
      }

      return (
        total +
        convertToBase(
          transaction.amount,
          transaction.currency,
        )
      );
    },
    0,
  ) : null);

  const secondSourceTotal = (source2 ? source2.reduce(
    (total, payment) => {
      const [amountString, currency] = payment.split(" ");

      const amount = Number(amountString);

      if (!Number.isFinite(amount)) {
        throw new Error(`Некорректная сумма: ${payment}`);
      }

      return total + convertToBase(amount, currency);
    },
    0,
  ) : null);

  return ((firstSourceTotal && secondSourceTotal) ? firstSourceTotal + secondSourceTotal : null);
}