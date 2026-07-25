export type Language = "en" | "ru" | "uk";
export type Theme = "light" | "dark";
export type Transaction = {
  type: "paid" | "pending" | "rejected";
  amount: string;
  currency: string;
};
export type FirstFinanceSource = {
  transactions: Transaction[];
  address: { city: string; street: string; houseNumber: number };
};
export type SecondFinanceSource = { amount: string; currency: string }[];
export type CurrencyData = {
  date: string;
  base: string;
  rates: Record<string, string>;
};
export type FinanceResult = [FirstFinanceSource, SecondFinanceSource];
export type FinanceData = { financeResult: FinanceResult; currencyData: CurrencyData };
