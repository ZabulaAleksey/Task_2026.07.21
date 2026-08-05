export type Language = "en" | "ru" | "uk";
export type Theme = "light" | "dark";
export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "online"
  | "reconnecting"
  | "stale"
  | "offline"
  | "demo";

export type {
  CurrencyData,
  FinanceData,
  FinanceResult,
  FirstFinanceSource,
  SecondFinanceSource,
} from "$lib/schemas/finance";
export type {
  CalendarEvent,
  Candle,
  LiveBalance,
  NewsItem,
  Quote,
  Timeframe,
} from "$lib/schemas/realtime";
