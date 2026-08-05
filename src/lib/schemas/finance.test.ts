import { describe, expect, it } from "vitest";
import { currencyDataSchema, decimalStringSchema } from "./finance";

describe("finance schemas", () => {
  it("bounds decimal strings", () => {
    expect(decimalStringSchema.safeParse("123.45").success).toBe(true);
    expect(decimalStringSchema.safeParse("1".repeat(65)).success).toBe(false);
  });

  it("bounds the currency-rate collection", () => {
    const rates = Object.fromEntries(
      Array.from({ length: 501 }, (_, index) => [`ASSET_${index}`, "1"]),
    );
    expect(
      currencyDataSchema.safeParse({
        date: "2026-08-05",
        base: "USD",
        rates,
      }).success,
    ).toBe(false);
  });
});
