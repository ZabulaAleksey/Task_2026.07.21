import { z } from "zod";

const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Некорректный код валюты");

const rateCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9.$_-]{1,30}$/, "Некорректный код актива");

const apiDateSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Некорректная дата")
  .transform((value) => new Date(value).toISOString().slice(0, 10));

const decimalStringSchema = z
  .union([z.string(), z.number().finite()])
  .transform((value) => String(value))
  .refine(
    (value) => /^-?\d+(?:\.\d+)?$/.test(value),
    "Некорректное денежное значение",
  );

const positiveDecimalStringSchema = decimalStringSchema.refine(
  (value) => Number(value) > 0,
  "Курс должен быть положительным",
);

const transactionSchema = z.object({
  type: z.enum(["paid", "pending", "rejected"]),
  amount: decimalStringSchema,
  currency: currencyCodeSchema,
});

const addressSchema = z.object({
  city: z.string(),
  street: z.string(),
  houseNumber: z.number().finite(),
});

export const firstFinanceSourceSchema = z.object({
  transactions: z.array(transactionSchema),
  address: addressSchema,
});

export const secondFinanceSourceSchema = z
  .array(z.string())
  .transform((payments, context) =>
    payments.map((payment) => {
      const match = payment.trim().match(/^(-?\d+(?:\.\d+)?)\s+([A-Za-z]{3})$/);

      if (!match) {
        context.addIssue({
          code: "custom",
          message: `Некорректный платёж: ${payment}`,
        });

        return { amount: "0", currency: "USD" };
      }

      return {
        amount: match[1],
        currency: match[2].toUpperCase(),
      };
    }),
  );

export const currencyDataSchema = z.object({
  date: apiDateSchema,
  base: currencyCodeSchema,
  rates: z.record(rateCodeSchema, positiveDecimalStringSchema),
});

export type FirstFinanceSource = z.infer<typeof firstFinanceSourceSchema>;
export type SecondFinanceSource = z.infer<typeof secondFinanceSourceSchema>;
export type CurrencyData = z.infer<typeof currencyDataSchema>;

export type FinanceResult = [
  FirstFinanceSource,
  SecondFinanceSource,
];

export type FinanceData = {
  financeResult: FinanceResult;
  currencyData: CurrencyData;
};
