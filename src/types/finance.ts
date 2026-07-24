// Тип данных из первого источника

type TransactionStatus = "paid" | "pending" | "rejected";

type Transaction = {
  type: TransactionStatus;
  amount: number;
  currency: string;
};

type Address = {
  city: string;
  street: string;
  houseNumber: number;
};

// Тип данных из второго источника

type Payment = `${number} ${string}`;

// Типы данных от двух источника

export type FinanceResult = [
  {
    transactions: Transaction[];
    address: Address;
  } | null,
  Payment[] | null,
];

// Тип данных из сайта курсов валют

export type CurrencyData = {
  date: string;
  base: string;
  rates: Record<string, string>;
};
