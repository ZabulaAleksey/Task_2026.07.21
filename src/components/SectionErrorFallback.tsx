import type { FallbackProps } from "react-error-boundary";
import { useLanguage } from "../i18n/language";

type Props = FallbackProps & { title: string };
export function SectionErrorFallback({ title, resetErrorBoundary }: Props) {
  const { t } = useLanguage();
  return (
    <div className="alert alert-danger shadow-sm h-100" role="alert"><div className="d-flex align-items-start gap-3">
      <i className="bi bi-exclamation-octagon-fill fs-4" /><div><h2 className="h6 alert-heading mb-1">{title}</h2>
      <p className="small mb-3">{t("sectionStillWorks")}</p>
      <button type="button" className="btn btn-sm btn-outline-danger" onClick={resetErrorBoundary}><i className="bi bi-arrow-clockwise me-2" />{t("retry")}</button></div>
    </div></div>
  );
}