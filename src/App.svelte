<script lang="ts">
  import { onDestroy } from "svelte";
  import ApiKeyForm from "./components/ApiKeyForm.svelte";
  import FinanceDashboard from "./components/FinanceDashboard.svelte";
  import FinanceNavbar from "./components/FinanceNavbar.svelte";
  import { AppError, getFinanceData } from "./lib/finance";
  import { language, translate } from "./lib/i18n";
  import type { FinanceData, Theme } from "./lib/types";

  function detectTheme(): Theme {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  let theme = $state<Theme>(detectTheme());
  let data = $state<FinanceData | null>(null);
  let error = $state<string | null>(null);
  let isLoading = $state(false);
  let activeRequest: AbortController | null = null;

  $effect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  });

  onDestroy(() => activeRequest?.abort());

  function toggleTheme() {
    theme = theme === "light" ? "dark" : "light";
  }

  async function load(apiKey: string) {
    activeRequest?.abort();
    const controller = new AbortController();
    activeRequest = controller;
    data = null;
    error = null;
    isLoading = true;
    try {
      data = await getFinanceData(apiKey, controller.signal);
    } catch (caught) {
      if (controller.signal.aborted) return;
      const appError = caught instanceof AppError ? caught : new AppError("unknownError");
      error = translate($language, appError.code, appError.values);
    } finally {
      if (activeRequest === controller) {
        activeRequest = null;
        isLoading = false;
      }
    }
  }
</script>

<main class="min-vh-100 bg-body-tertiary">
  <FinanceNavbar {theme} onToggleTheme={toggleTheme} />
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-9 col-xl-8">
        <ApiKeyForm {error} {isLoading} onSubmit={load} />
        {#if data}<FinanceDashboard {data} />{/if}
      </div>
    </div>
  </div>
</main>
