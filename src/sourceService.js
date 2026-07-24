import { env } from "../config/env.js";
import type { Transaction } from "../types/finance.js";

type UnknownRecord = Record<string, unknown>;

async function requestSource(
  url: string,
  apiKey: string,
): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Неверный API-ключ.");
    }

    throw new Error(
      `Источник данных вернул HTTP ${response.status}.`,
    );
  }

  return response.json();
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function isTransaction(value: unknown): value is Transaction {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.type === "string" &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    typeof value.currency === "string"
  );
}

function extractTransactions(data: unknown): Transaction[] {
  let transactions: unknown;

  if (Array.isArray(data)) {
    transactions = data;
  } else if (isRecord(data)) {
    transactions = data.transactions;
  }

  if (!Array.isArray(transactions)) {
    throw new Error(
      "Источник вернул неизвестную структуру данных.",
    );
  }

  if (!transactions.every(isTransaction)) {
    throw new Error(
      "Источник содержит некорректные транзакции.",
    );
  }

  return transactions;
}

export async function getAllTransactions(
  apiKey: string,
): Promise<Transaction[]> {
  const [source1, source2] = await Promise.all([
    requestSource(env.financeSource1Url, apiKey),
    requestSource(env.financeSource2Url, apiKey),
  ]);

  return [
    ...extractTransactions(source1),
    ...extractTransactions(source2),
  ];
}