import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import type { FinanceData } from "../schemas/finance";
import { useLanguage } from "../i18n/language";
import { CurrencyRatesCard, CurrencyTotalsCard, TotalCard } from "./FinanceResults";
import { SectionErrorFallback } from "./SectionErrorFallback";

type Props = { data: FinanceData };

export function FinanceDashboard({ data }: Props) {
  const { t } = useLanguage();
  const boundary = (title: string) => (props: FallbackProps) => <SectionErrorFallback {...props} title={title} />;
  return (
    <div className="row g-4 mt-1 text-start">
      <div className="col-12"><ErrorBoundary fallbackRender={boundary(t("totalError"))} resetKeys={[data]}><TotalCard {...data} /></ErrorBoundary></div>
      <div className="col-12 col-md-6"><ErrorBoundary fallbackRender={boundary(t("groupingError"))} resetKeys={[data]}><CurrencyTotalsCard financeResult={data.financeResult} /></ErrorBoundary></div>
      <div className="col-12 col-md-6"><ErrorBoundary fallbackRender={boundary(t("ratesError"))} resetKeys={[data]}><CurrencyRatesCard {...data} /></ErrorBoundary></div>
    </div>
  );
}