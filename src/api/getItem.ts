import type { z } from "zod";
import { AppError } from "../errors/AppError";

type RequestOptions = {
  apiKey?: string;
  signal?: AbortSignal;
  source?: string;
};

export async function getItem<T>(
  url: string,
  schema: z.ZodType<T>,
  { apiKey, signal, source = "API" }: RequestOptions = {},
): Promise<T> {
  const headers: HeadersInit = { Accept: "application/json" };
  if (apiKey) headers["x-api-key"] = apiKey;

  const response = await fetch(url, { headers, signal });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AppError("requestFailed", { status: String(response.status), source });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    console.error("Invalid API response", parsed.error.issues);
    throw new AppError("invalidApiResponse", { source });
  }

  return parsed.data;
}