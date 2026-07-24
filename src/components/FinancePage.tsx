import { useState, useEffect } from "react";
import { getCurrency, getPaidFinance } from "../api/financeApi";
import type { CurrencyData, FinanceResult } from "../types/finance";
import "bootstrap/dist/css/bootstrap.min.css";
import calculateFinanceTotal from "./calculateFinanceTotal";
import { ApiKeyCurrency } from "../../env/env.ts"


type Theme = "light" | "dark";

export function FinancePage() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [firstResult, setFirstResult] = useState<FinanceResult[0]>(null);
  const [secondResult, setSecondResult] = useState<FinanceResult[1]>(null);
  const [currencyData, setCurrencyData] = useState<CurrencyData>({
  date: "",
  base: "USD",
  rates: {},
});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
  const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
  });


  useEffect(() => {
    document.documentElement.setAttribute(
      "data-bs-theme",
      theme,
    );

    localStorage.setItem("theme", theme);
  }, [theme]);

  async function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedApiKey = apiKey.trim();

    if (!normalizedApiKey) {
      setError("Введите API-ключ.");
      return;
    }

    setError(null);
    setFirstResult(null);
    setSecondResult(null);
    setIsLoading(true);

    try {
const [firstData, secondData, currency] = await Promise.all([
    getPaidFinance<FinanceResult[0]>(
      normalizedApiKey,
      "https://cpa-server-vtel.onrender.com/api/finance1",
    ),

    getPaidFinance<FinanceResult[1]>(
      normalizedApiKey,
      "https://cpa-server-vtel.onrender.com/api/finance2",
    ),

    getCurrency(`https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${ApiKeyCurrency}`,
    ),
  ]);

  setFirstResult(firstData);
  setSecondResult(secondData);
  setCurrencyData(currency);
    } catch (requestError) {
  setError(
    requestError instanceof Error
      ? requestError.message
      : "Произошла неизвестная ошибка.");
    } finally {
      setIsLoading(false);
    }
  }

  function changeTheme() {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light",
    );
  }

const total =
  firstResult && secondResult
    ? calculateFinanceTotal(
        [firstResult, secondResult],
        currencyData,
      )
    : null;

  return (
    <main className="min-vh-100 bg-body-tertiary">
      <nav className="navbar bg-body border-bottom shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-semibold">
            <i className="bi bi-currency-dollar me-2" />
            Finance Aggregator
          </span>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={changeTheme}
            aria-label="Переключить тему"
          >
            <i
              className={
                theme === "light"
                  ? "bi bi-moon-stars"
                  : "bi bi-sun"
              }
            />
            <span className="ms-2">
              {theme === "light"
                ? "Тёмная тема"
                : "Светлая тема"}
            </span>
          </button>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-7">
            <div className="card border-0 shadow">
              <div className="card-body p-4 p-md-5">
                <h1 className="h3 mb-2">
                  Получение финансовых данных
                </h1>

                <p className="text-body-secondary mb-4">
                  Введите ключ доступа для получения и
                  объединения данных из финансовых источников.
                </p>

                    <form onSubmit={handleSubmit}>
                  <label
                    htmlFor="apiKey"
                    className="form-label fw-semibold"
                  >
                    API-ключ
                  </label>

                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-key" />
                    </span>

                    <input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      className="form-control"
                      placeholder="Введите API-ключ"
                      value={apiKey}
                      onChange={(event) =>
                        setApiKey(event.target.value)
                      }
                      autoComplete="off"
                      disabled={isLoading}
                    />

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        setShowApiKey((current) => !current)
                      }
                      aria-label={
                        showApiKey
                          ? "Скрыть ключ"
                          : "Показать ключ"
                      }
                    >
                      <i
                        className={
                          showApiKey
                            ? "bi bi-eye-slash"
                            : "bi bi-eye"
                        }
                      />
                    </button>
                  </div>

                  <div className="form-text">
                    Ключ используется только для текущего
                    запроса и не сохраняется в localStorage.
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        />
                        Получение данных...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2" />
                        Отправить запрос
                      </>
                    )}
                  </button>
                </form>

                {error && (
                  <div
                    className="alert alert-danger mt-4 mb-0"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle me-2" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title">Общая сумма</h5>
                  <p className="fs-2 fw-bold mb-">
                    {total !== null
                      ? `$${total.toFixed(2)}`
                      : "Данных нет"}
                  </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}