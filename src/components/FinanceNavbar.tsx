import type { Theme } from "../hooks/useTheme";
import { useLanguage, type Language } from "../i18n/language";
import { FinanceLogo } from "./FinanceLogo";

type Props = { theme: Theme; onToggleTheme: () => void };
const languageLabels: Record<Language, string> = { en: "EN", ru: "RU", uk: "UA" };

export function FinanceNavbar({ theme, onToggleTheme }: Props) {
  const { language, setLanguage, t } = useLanguage();
  const isLight = theme === "light";

  return (
    <nav className="navbar bg-body border-bottom shadow-sm">
      <div className="container gap-2">
        <span className="navbar-brand me-auto py-0"><FinanceLogo /></span>
        <label className="visually-hidden" htmlFor="language">{t("language")}</label>
        <select
          id="language"
          className="form-select form-select-sm w-auto"
          value={language}
          onChange={(event) => setLanguage(event.target.value as Language)}
          aria-label={t("language")}
        >
          {(Object.keys(languageLabels) as Language[]).map((item) => (
            <option value={item} key={item}>{languageLabels[item]}</option>
          ))}
        </select>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onToggleTheme} aria-label={isLight ? t("darkTheme") : t("lightTheme")}>
          <i className={isLight ? "bi bi-moon-stars" : "bi bi-sun"} />
          <span className="d-none d-sm-inline ms-2">{isLight ? t("darkTheme") : t("lightTheme")}</span>
        </button>
      </div>
    </nav>
  );
}