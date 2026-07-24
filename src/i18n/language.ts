import { createContext, useContext } from "react";

export type Language = "en" | "ru" | "uk";

export const translations = {
  en: {
    darkTheme: "Dark theme",
    lightTheme: "Light theme",
    language: "Language",
    formTitle: "Get financial data",
    formDescription:
      "Enter an access key to retrieve and combine data from financial sources.",
    apiKey: "API key",
    apiKeyPlaceholder: "Enter API key",
    apiKeyHelp: "The key is used only for this request and is not stored.",
    apiKeyRequired: "Enter an API key.",
    loading: "Loading data...",
    submit: "Send request",
    total: "Total amount",
    finalRounded: "The final value is bank-rounded in {currency}.",
    totalsByCurrency: "Amounts by currency",
    noIntermediateRounding: "No intermediate rounding",
    currentRates: "Current rates",
    asOf: "As of {date}",
    totalError: "Could not calculate the total",
    groupingError: "Could not group the amounts",
    ratesError: "Could not display exchange rates",
    sectionStillWorks: "The rest of the page continues to work.",
    retry: "Try again",
    appError: "The application could not continue",
    appErrorHelp: "Refresh the data or try again.",
    invalidApiResponse: "{source} returned data in an unknown format.",
    requestFailed: "{source} request failed (HTTP {status}).",
    missingCurrencyApiKey: "The currency API key is not configured.",
    missingCurrencyRate: "No exchange rate was provided for {currency}.",
    unknownError: "An unknown error occurred.",
  },
  ru: {
    darkTheme: "Тёмная тема",
    lightTheme: "Светлая тема",
    language: "Язык",
    formTitle: "Получение финансовых данных",
    formDescription:
      "Введите ключ доступа для получения и объединения данных из финансовых источников.",
    apiKey: "API-ключ",
    apiKeyPlaceholder: "Введите API-ключ",
    apiKeyHelp: "Ключ используется только для текущего запроса и не сохраняется.",
    apiKeyRequired: "Введите API-ключ.",
    loading: "Получение данных...",
    submit: "Отправить запрос",
    total: "Общая сумма",
    finalRounded: "Финальное значение округлено по банковскому правилу в {currency}.",
    totalsByCurrency: "Суммы по валютам",
    noIntermediateRounding: "Без промежуточного округления",
    currentRates: "Актуальные курсы",
    asOf: "По состоянию на {date}",
    totalError: "Не удалось рассчитать общую сумму",
    groupingError: "Не удалось сгруппировать суммы",
    ratesError: "Не удалось показать курсы валют",
    sectionStillWorks: "Остальная часть страницы продолжает работать.",
    retry: "Повторить",
    appError: "Приложение не смогло продолжить работу",
    appErrorHelp: "Обновите данные или повторите попытку.",
    invalidApiResponse: "{source}: API вернул данные неизвестного формата.",
    requestFailed: "{source}: ошибка запроса (HTTP {status}).",
    missingCurrencyApiKey: "Не настроен ключ валютного API.",
    missingCurrencyRate: "Для валюты {currency} не предоставлен курс обмена.",
    unknownError: "Произошла неизвестная ошибка.",
  },
  uk: {
    darkTheme: "Темна тема",
    lightTheme: "Світла тема",
    language: "Мова",
    formTitle: "Отримання фінансових даних",
    formDescription:
      "Введіть ключ доступу для отримання та об’єднання даних із фінансових джерел.",
    apiKey: "API-ключ",
    apiKeyPlaceholder: "Введіть API-ключ",
    apiKeyHelp: "Ключ використовується лише для поточного запиту та не зберігається.",
    apiKeyRequired: "Введіть API-ключ.",
    loading: "Отримання даних...",
    submit: "Надіслати запит",
    total: "Загальна сума",
    finalRounded: "Кінцеве значення округлено за банківським правилом у {currency}.",
    totalsByCurrency: "Суми за валютами",
    noIntermediateRounding: "Без проміжного округлення",
    currentRates: "Актуальні курси",
    asOf: "Станом на {date}",
    totalError: "Не вдалося розрахувати загальну суму",
    groupingError: "Не вдалося згрупувати суми",
    ratesError: "Не вдалося показати курси валют",
    sectionStillWorks: "Решта сторінки продовжує працювати.",
    retry: "Повторити",
    appError: "Застосунок не зміг продовжити роботу",
    appErrorHelp: "Оновіть дані або повторіть спробу.",
    invalidApiResponse: "{source}: API повернув дані невідомого формату.",
    requestFailed: "{source}: помилка запиту (HTTP {status}).",
    missingCurrencyApiKey: "Не налаштовано ключ валютного API.",
    missingCurrencyRate: "Для валюти {currency} не надано курс обміну.",
    unknownError: "Сталася невідома помилка.",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];
export type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: Record<string, string>) => string;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function detectLanguage(): Language {
  const savedLanguage = localStorage.getItem("language");

  if (savedLanguage === "en" || savedLanguage === "ru" || savedLanguage === "uk") {
    return savedLanguage;
  }

  for (const browserLanguage of navigator.languages) {
    const language = browserLanguage.toLowerCase().split("-")[0];

    if (language === "ru" || language === "uk" || language === "en") {
      return language;
    }
  }

  return "en";
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
