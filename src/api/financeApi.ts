import type { CurrencyData } from "../types/finance";

type ErrorResponse = {
  message?: string;
};

export async function getPaidFinance<T>(
  apiKey: string,
  Url: string,
): Promise<T> {
  const response = await fetch(Url, {
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => null)) as ErrorResponse | null;

    throw new Error(
      errorData?.message ?? `Ошибка запроса: HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function getCurrency(Url: string): Promise<CurrencyData> {
  const response = await fetch(Url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => null)) as ErrorResponse | null;

    throw new Error(
      errorData?.message ?? `Ошибка запроса: HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<CurrencyData>;
}
