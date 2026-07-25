<script setup lang="ts">
import { computed } from "vue";
import { currencyTotals, financeTotal } from "../lib/finance";
import { language, translate } from "../lib/i18n";
import type { FinanceData, Language } from "../lib/types";

const props = defineProps<{ data: FinanceData }>();
const locales: Record<Language, string> = { en: "en-US", ru: "ru-RU", uk: "uk-UA" };
const totals = computed(() => currencyTotals(props.data.financeResult));
const totalFormatted = computed(() => new Intl.NumberFormat(locales[language.value], {
  style: "currency", currency: props.data.currencyData.base
}).format(Number(financeTotal(props.data.financeResult, props.data.currencyData))));
const formattedDate = computed(() => new Intl.DateTimeFormat(locales[language.value], {
  dateStyle: "medium", timeZone: "UTC"
}).format(new Date(`${props.data.currencyData.date}T00:00:00Z`)));
const formatCurrency = (amount: string, currency: string) =>
  new Intl.NumberFormat(locales[language.value], { style: "currency", currency }).format(Number(amount));
const formatRate = (rate: string) =>
  new Intl.NumberFormat(locales[language.value], { maximumFractionDigits: 6 }).format(Number(rate));
</script>

<template>
  <div class="row g-4 mt-1 text-start">
    <div class="col-12">
      <section class="card border-0 shadow-sm h-100 overflow-hidden">
        <div class="card-body p-4 bg-primary bg-gradient text-white">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-white-50 small text-uppercase fw-semibold">{{ translate("total") }}</span>
              <p class="display-6 fw-bold mb-0">{{ totalFormatted }}</p>
            </div>
            <i class="bi bi-wallet2 display-5 opacity-50"></i>
          </div>
          <div class="small text-white-50 mt-2">
            {{ translate("finalRounded", { currency: data.currencyData.base }) }}
          </div>
        </div>
      </section>
    </div>
    <div class="col-12 col-md-6">
      <section class="card border-0 shadow-sm h-100">
        <div class="card-header bg-body border-0 px-4 pt-4 pb-2">
          <h2 class="h5 mb-1"><i class="bi bi-cash-stack text-success me-2"></i>{{ translate("totalsByCurrency") }}</h2>
          <p class="small text-body-secondary mb-0">{{ translate("noIntermediateRounding") }}</p>
        </div>
        <div class="card-body px-4 pb-4"><div class="list-group list-group-flush">
          <div v-for="item in totals" :key="item.currency"
            class="list-group-item px-0 py-3 d-flex align-items-center justify-content-between">
            <span class="badge text-bg-success-subtle text-success-emphasis rounded-pill px-3 py-2">
              {{ item.currency }}
            </span>
            <strong class="fs-5">{{ formatCurrency(item.amount, item.currency) }}</strong>
          </div>
        </div></div>
      </section>
    </div>
    <div class="col-12 col-md-6">
      <section class="card border-0 shadow-sm h-100">
        <div class="card-header bg-body border-0 px-4 pt-4 pb-2">
          <h2 class="h5 mb-1"><i class="bi bi-graph-up-arrow text-info me-2"></i>{{ translate("currentRates") }}</h2>
          <p class="small text-body-secondary mb-0">{{ translate("asOf", { date: formattedDate }) }}</p>
        </div>
        <div class="card-body px-4 pb-4"><div class="list-group list-group-flush">
          <div v-for="item in totals" :key="item.currency"
            class="list-group-item px-0 py-3 d-flex align-items-center justify-content-between">
            <span class="text-body-secondary">1 {{ data.currencyData.base }}</span>
            <strong>
              {{ formatRate(item.currency === data.currencyData.base ? "1" : data.currencyData.rates[item.currency]) }}
              <span class="text-info-emphasis">{{ item.currency }}</span>
            </strong>
          </div>
        </div></div>
      </section>
    </div>
  </div>
</template>
