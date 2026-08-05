import { describe, expect, it } from "vitest";
import { createDemoSnapshot } from "$lib/demo/market";
import { parseRealtimeEvent } from "./realtime";

describe("realtime protocol", () => {
  it("accepts the versioned demo snapshot", () => {
    expect(parseRealtimeEvent(createDemoSnapshot())).not.toBeNull();
  });

  it("rejects malformed or future events", () => {
    expect(parseRealtimeEvent({ type: "quote.update" })).toBeNull();
    expect(
      parseRealtimeEvent({
        version: 2,
        sequence: 1,
        serverTime: Date.now(),
        type: "heartbeat",
        data: {},
      }),
    ).toBeNull();
  });

  it("rejects oversized snapshots", () => {
    const snapshot = createDemoSnapshot();
    if (snapshot.type !== "snapshot") throw new Error("Expected snapshot");
    snapshot.data.quotes = Array.from(
      { length: 101 },
      () => snapshot.data.quotes[0],
    );
    expect(parseRealtimeEvent(snapshot)).toBeNull();
  });

  it("rejects crossed quotes and invalid OHLC candles", () => {
    expect(
      parseRealtimeEvent({
        version: 1,
        sequence: 2,
        serverTime: Date.now(),
        type: "quote.update",
        data: {
          symbol: "EURUSD",
          bid: "1.20",
          ask: "1.10",
          changePercent: "0",
          timestamp: Date.now(),
        },
      }),
    ).toBeNull();

    expect(
      parseRealtimeEvent({
        version: 1,
        sequence: 3,
        serverTime: Date.now(),
        type: "candle.update",
        data: {
          symbol: "EURUSD",
          timeframe: "1m",
          timestamp: Date.now(),
          open: "1.10",
          high: "1.05",
          low: "1.00",
          close: "1.08",
          volume: "100",
          closed: false,
        },
      }),
    ).toBeNull();
  });
});
