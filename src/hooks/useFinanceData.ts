import { useEffect, useRef, useState } from "react";
import { AppError } from "../errors/AppError";
import { useLanguage } from "../i18n/language";
import type { FinanceData } from "../schemas/finance";
import { getFinanceData } from "../services/financeService";

export function useFinanceData() {
  const { t } = useLanguage();
  const [data, setData] = useState<FinanceData | null>(null);
  const [requestError, setRequestError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  const loadFinanceData = async (apiKey: string) => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setRequestError(null);
    setData(null);
    setIsLoading(true);

    try {
      setData(await getFinanceData(apiKey, controller.signal));
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setRequestError(
        requestError instanceof AppError
          ? requestError
          : new AppError("unknownError"),
      );
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setIsLoading(false);
      }
    }
  };

  const error = requestError
    ? t(requestError.code, requestError.values)
    : null;

  return { data, error, isLoading, loadFinanceData };
}