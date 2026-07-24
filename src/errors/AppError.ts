export type AppErrorCode =
  | "invalidApiResponse"
  | "requestFailed"
  | "missingCurrencyApiKey"
  | "missingCurrencyRate"
  | "unknownError";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly values: Record<string, string>;

  constructor(code: AppErrorCode, values: Record<string, string> = {}) {
    super(code);
    this.name = "AppError";
    this.code = code;
    this.values = values;
  }
}