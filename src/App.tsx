import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { FinancePage } from "./components/FinancePage";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { useLanguage } from "./i18n/language";

function AppFallback({ resetErrorBoundary }: FallbackProps) {
  const { t } = useLanguage();
  return <main className="container py-5"><div className="alert alert-danger shadow" role="alert">
    <h1 className="h4 alert-heading">{t("appError")}</h1><p>{t("appErrorHelp")}</p>
    <button className="btn btn-outline-danger" onClick={resetErrorBoundary}>{t("retry")}</button>
  </div></main>;
}

export default function App() {
  return <LanguageProvider><ErrorBoundary FallbackComponent={AppFallback}><FinancePage /></ErrorBoundary></LanguageProvider>;
}