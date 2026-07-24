import type { CurrencyData, FinanceResult } from "../schemas/finance";
import calculateCurrencyTotals from "../services/calculateCurrencyTotals";
import calculateFinanceTotal from "../services/calculateFinanceTotal";
import { useLanguage } from "../i18n/language";

type ResultsProps = { financeResult: FinanceResult };
type CurrencyResultsProps = ResultsProps & { currencyData: CurrencyData };
const locales = { en: "en-US", ru: "ru-RU", uk: "uk-UA" } as const;

export function TotalCard({ financeResult, currencyData }: CurrencyResultsProps) {
  const { language, t } = useLanguage();
  const total = calculateFinanceTotal(financeResult, currencyData);
  const formatted = new Intl.NumberFormat(locales[language], { style: "currency", currency: currencyData.base }).format(Number(total));
  return (
    <section className="card border-0 shadow-sm h-100 overflow-hidden">
      <div className="card-body p-4 bg-primary bg-gradient text-white">
        <div className="d-flex align-items-center justify-content-between">
          <div><span className="text-white-50 small text-uppercase fw-semibold">{t("total")}</span><p className="display-6 fw-bold mb-0">{formatted}</p></div>
          <i className="bi bi-wallet2 display-5 opacity-50" />
        </div>
        <div className="small text-white-50 mt-2">{t("finalRounded", { currency: currencyData.base })}</div>
      </div>
    </section>
  );
}

export function CurrencyTotalsCard({ financeResult }: ResultsProps) {
  const { language, t } = useLanguage();
  const totals = calculateCurrencyTotals(financeResult);
  return (
    <section className="card border-0 shadow-sm h-100">
      <div className="card-header bg-body border-0 px-4 pt-4 pb-2">
        <h2 className="h5 mb-1"><i className="bi bi-cash-stack text-success me-2" />{t("totalsByCurrency")}</h2>
        <p className="small text-body-secondary mb-0">{t("noIntermediateRounding")}</p>
      </div>
      <div className="card-body px-4 pb-4"><div className="list-group list-group-flush">
        {totals.map(({ currency, amount }) => (
          <div className="list-group-item px-0 py-3 d-flex align-items-center justify-content-between" key={currency}>
            <span className="badge text-bg-success-subtle text-success-emphasis rounded-pill px-3 py-2">{currency}</span>
            <strong className="fs-5">{new Intl.NumberFormat(locales[language], { style: "currency", currency }).format(Number(amount))}</strong>
          </div>
        ))}
      </div></div>
    </section>
  );
}

export function CurrencyRatesCard({ financeResult, currencyData }: CurrencyResultsProps) {
  const { language, t } = useLanguage();
  const base = currencyData.base;
  const rates = calculateCurrencyTotals(financeResult).map(({ currency }) => ({ currency, rate: currency === base ? "1" : currencyData.rates[currency] }));
  const formattedDate = new Intl.DateTimeFormat(locales[language], { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${currencyData.date}T00:00:00Z`));
  return (
    <section className="card border-0 shadow-sm h-100">
      <div className="card-header bg-body border-0 px-4 pt-4 pb-2">
        <h2 className="h5 mb-1"><i className="bi bi-graph-up-arrow text-info me-2" />{t("currentRates")}</h2>
        <p className="small text-body-secondary mb-0">{t("asOf", { date: formattedDate })}</p>
      </div>
      <div className="card-body px-4 pb-4"><div className="list-group list-group-flush">
        {rates.map(({ currency, rate }) => (
          <div className="list-group-item px-0 py-3 d-flex align-items-center justify-content-between" key={currency}>
            <span className="text-body-secondary">1 {base}</span>
            <strong>{new Intl.NumberFormat(locales[language], { maximumFractionDigits: 6 }).format(Number(rate))} <span className="text-info-emphasis">{currency}</span></strong>
          </div>
        ))}
      </div></div>
    </section>
  );
}