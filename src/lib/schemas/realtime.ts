import Decimal from "decimal.js-light";
import { z } from "zod";
import { decimalStringSchema } from "./finance";

const MIN_TIMESTAMP = Date.UTC(2000, 0, 1);
const MAX_FUTURE_TIMESTAMP_MS = 5 * 366 * 24 * 60 * 60 * 1_000;
const timestampSchema = z
  .number()
  .int()
  .min(MIN_TIMESTAMP)
  .max(Number.MAX_SAFE_INTEGER)
  .refine(
    (value) => value <= Date.now() + MAX_FUTURE_TIMESTAMP_MS,
    "timestampTooFarInFuture",
  );
const importanceSchema = z.enum(["low", "medium", "high"]);
const timeframeSchema = z.enum(["1m", "5m", "15m", "1h"]);

export const quoteSchema = z
  .object({
    symbol: z.string().regex(/^[A-Z]{6}$/),
    bid: decimalStringSchema,
    ask: decimalStringSchema,
    changePercent: decimalStringSchema,
    timestamp: timestampSchema,
  })
  .refine((quote) => new Decimal(quote.ask).gte(quote.bid), {
    message: "askBelowBid",
    path: ["ask"],
  });

export const candleSchema = z
  .object({
    symbol: z.string().regex(/^[A-Z]{6}$/),
    timeframe: timeframeSchema,
    timestamp: timestampSchema,
    open: decimalStringSchema,
    high: decimalStringSchema,
    low: decimalStringSchema,
    close: decimalStringSchema,
    volume: decimalStringSchema,
    closed: z.boolean(),
  })
  .superRefine((candle, context) => {
    const open = new Decimal(candle.open);
    const high = new Decimal(candle.high);
    const low = new Decimal(candle.low);
    const close = new Decimal(candle.close);
    if (high.lt(open) || high.lt(close) || high.lt(low)) {
      context.addIssue({
        code: "custom",
        message: "highBelowCandleValue",
        path: ["high"],
      });
    }
    if (low.gt(open) || low.gt(close) || low.gt(high)) {
      context.addIssue({
        code: "custom",
        message: "lowAboveCandleValue",
        path: ["low"],
      });
    }
  });

export const liveBalanceSchema = z.object({
  currency: z.string().regex(/^[A-Z]{3}$/),
  available: decimalStringSchema,
  reserved: decimalStringSchema,
  convertedUsd: decimalStringSchema,
  timestamp: timestampSchema,
});

export const newsItemSchema = z.object({
  id: z.string().min(1).max(128),
  headline: z.string().min(1).max(300),
  summary: z.string().max(1200),
  source: z.string().min(1).max(100),
  currencies: z.array(z.string().regex(/^[A-Z]{3}$/)).max(12),
  publishedAt: timestampSchema,
  importance: importanceSchema,
});

export const calendarEventSchema = z.object({
  id: z.string().min(1).max(128),
  title: z.string().min(1).max(300),
  currency: z.string().regex(/^[A-Z]{3}$/),
  country: z.string().min(2).max(80),
  scheduledAt: timestampSchema,
  importance: importanceSchema,
  previous: z.string().max(64).optional(),
  forecast: z.string().max(64).optional(),
  actual: z.string().max(64).optional(),
});

const envelope = {
  version: z.literal(1),
  sequence: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  serverTime: timestampSchema,
};

export const realtimeEventSchema = z.discriminatedUnion("type", [
  z.object({
    ...envelope,
    type: z.literal("snapshot"),
    data: z.object({
      quotes: z.array(quoteSchema).max(100),
      candles: z.array(candleSchema).max(6_000),
      balances: z.array(liveBalanceSchema).max(100),
      news: z.array(newsItemSchema).max(500),
      calendar: z.array(calendarEventSchema).max(1_000),
    }),
  }),
  z.object({ ...envelope, type: z.literal("quote.update"), data: quoteSchema }),
  z.object({
    ...envelope,
    type: z.literal("candle.update"),
    data: candleSchema,
  }),
  z.object({
    ...envelope,
    type: z.literal("balance.update"),
    data: liveBalanceSchema,
  }),
  z.object({
    ...envelope,
    type: z.literal("news.create"),
    data: newsItemSchema,
  }),
  z.object({
    ...envelope,
    type: z.literal("calendar.update"),
    data: calendarEventSchema,
  }),
  z.object({
    ...envelope,
    type: z.literal("heartbeat"),
    data: z.object({ connectionId: z.string().max(128).optional() }),
  }),
]);

export type Quote = z.infer<typeof quoteSchema>;
export type Candle = z.infer<typeof candleSchema>;
export type LiveBalance = z.infer<typeof liveBalanceSchema>;
export type NewsItem = z.infer<typeof newsItemSchema>;
export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export type Timeframe = z.infer<typeof timeframeSchema>;
export type RealtimeEvent = z.infer<typeof realtimeEventSchema>;

export function parseRealtimeEvent(payload: unknown): RealtimeEvent | null {
  const result = realtimeEventSchema.safeParse(payload);
  return result.success ? result.data : null;
}
