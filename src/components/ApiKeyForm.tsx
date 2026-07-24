import { useState } from "react";
import { useLanguage } from "../i18n/language";

type Props = { error: string | null; isLoading: boolean; onSubmit: (apiKey: string) => void };

export function ApiKeyForm({ error, isLoading, onSubmit }: Props) {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedApiKey = apiKey.trim();
    if (!normalizedApiKey) { setValidationError(t("apiKeyRequired")); return; }
    setValidationError(null);
    onSubmit(normalizedApiKey);
  };
  const visibleError = validationError ?? error;

  return (
    <section className="card border-0 shadow">
      <div className="card-body p-4 p-md-5">
        <h1 className="h3 mb-2">{t("formTitle")}</h1>
        <p className="text-body-secondary mb-4">{t("formDescription")}</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="apiKey" className="form-label fw-semibold">{t("apiKey")}</label>
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-key" /></span>
            <input id="apiKey" type={showApiKey ? "text" : "password"} className="form-control" placeholder={t("apiKeyPlaceholder")} value={apiKey} onChange={(event) => setApiKey(event.target.value)} autoComplete="off" disabled={isLoading} aria-invalid={Boolean(visibleError)} />
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowApiKey((current) => !current)} aria-label={showApiKey ? "Hide" : "Show"}>
              <i className={showApiKey ? "bi bi-eye-slash" : "bi bi-eye"} />
            </button>
          </div>
          <div className="form-text">{t("apiKeyHelp")}</div>
          <button type="submit" className="btn btn-primary w-100 mt-4" disabled={isLoading}>
            {isLoading ? <><span className="spinner-border spinner-border-sm me-2" />{t("loading")}</> : <><i className="bi bi-send me-2" />{t("submit")}</>}
          </button>
        </form>
        {visibleError && <div className="alert alert-danger mt-4 mb-0" role="alert"><i className="bi bi-exclamation-triangle me-2" />{visibleError}</div>}
      </div>
    </section>
  );
}