<script lang="ts">
  import { language, translate } from "../lib/i18n";
  import type { Language, Theme } from "../lib/types";
  import FinanceLogo from "./FinanceLogo.svelte";

  let { theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void } = $props();
  const labels: Record<Language, string> = { en: "EN", ru: "RU", uk: "UA" };
  const t = (key: Parameters<typeof translate>[1]) => translate($language, key);

  function chooseLanguage(event: Event) {
    language.set((event.currentTarget as HTMLSelectElement).value as Language);
  }
</script>

<nav class="navbar bg-body border-bottom shadow-sm">
  <div class="container gap-2">
    <span class="navbar-brand me-auto py-0"><FinanceLogo /></span>
    <label class="visually-hidden" for="language">{t("language")}</label>
    <select id="language" class="form-select form-select-sm w-auto" value={$language}
      onchange={chooseLanguage} aria-label={t("language")}>
      {#each Object.entries(labels) as [value, label]}
        <option {value}>{label}</option>
      {/each}
    </select>
    <button type="button" class="btn btn-sm btn-outline-secondary" onclick={onToggleTheme}
      aria-label={theme === "light" ? t("darkTheme") : t("lightTheme")}>
      <i class={theme === "light" ? "bi bi-moon-stars" : "bi bi-sun"}></i>
      <span class="d-none d-sm-inline ms-2">
        {theme === "light" ? t("darkTheme") : t("lightTheme")}
      </span>
    </button>
  </div>
</nav>
