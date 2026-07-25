<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import ApiKeyForm from "./components/ApiKeyForm.vue";
import FinanceDashboard from "./components/FinanceDashboard.vue";
import FinanceNavbar from "./components/FinanceNavbar.vue";
import { AppError, getFinanceData } from "./lib/finance";
import { translate } from "./lib/i18n";
import type { FinanceData, Theme } from "./lib/types";

function detectTheme(): Theme {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const theme = ref<Theme>(detectTheme());
const data = ref<FinanceData | null>(null);
const error = ref<string | null>(null);
const isLoading = ref(false);
let activeRequest: AbortController | null = null;

watch(theme, (value) => {
  document.documentElement.setAttribute("data-bs-theme", value);
  localStorage.setItem("theme", value);
}, { immediate: true });

onBeforeUnmount(() => activeRequest?.abort());

async function load(apiKey: string) {
  activeRequest?.abort();
  const controller = new AbortController();
  activeRequest = controller;
  data.value = null;
  error.value = null;
  isLoading.value = true;
  try {
    data.value = await getFinanceData(apiKey, controller.signal);
  } catch (caught) {
    if (controller.signal.aborted) return;
    const appError = caught instanceof AppError ? caught : new AppError("unknownError");
    error.value = translate(appError.code, appError.values);
  } finally {
    if (activeRequest === controller) {
      activeRequest = null;
      isLoading.value = false;
    }
  }
}
</script>

<template>
  <main class="min-vh-100 bg-body-tertiary">
    <FinanceNavbar :theme="theme" @toggle-theme="theme = theme === 'light' ? 'dark' : 'light'" />
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-9 col-xl-8">
          <ApiKeyForm :error="error" :is-loading="isLoading" @submit="load" />
          <FinanceDashboard v-if="data" :data="data" />
        </div>
      </div>
    </div>
  </main>
</template>
