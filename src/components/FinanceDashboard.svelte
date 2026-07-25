<script lang="ts">
  import { language, translate } from "../lib/i18n";
  import { currencyTotals, financeTotal } from "../lib/finance";
  import type { FinanceData, Language } from "../lib/types";

  let { data }: { data: FinanceData } = $props();
  const locales: Record<Language, string> = { en: "en-US", ru: "ru-RU", uk: "uk-UA" };
  const t = (key: Parameters<typeof translate>[1], values: Record<string, string> = {}) =>
    translate($language, key, values);
  const totals = $derived(currencyTotals(data.financeResult));
  const total = $derived(financeTotal(data.financeResult, data.currencyData));
  const totalFormatted = $derived(new Intl.NumberFormat(locales[$language], {
    style: "currency", currency: data.currencyData.base
  }).format(Number(total)));
  const formattedDate = $derived(new Intl.DateTimeFormat(locales[$language], {
    dateStyle: "medium", timeZone: "UTC"
  }).format(new Date(`${data.currencyData.date}T00:00:00Z`)));
</script>

<div class="row g-4 mt-1 text-start">
  <div class="col-12">
    <section class="card border-0 shadow-sm h-100 overflow-hidden">
      <div class="card-body p-4 bg-primary bg-gradient text-white">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <span class="text-white-50 small text-uppercase fw-semibold">{t("total")}</span>
            <p class="display-6 fw-bold mb-0">{totalFormatted}</p>
          </div>
          <i class="bi bi-wallet2 display-5 opacity-50"></i>
        </div>
        <div class="small text-white-50 mt-2">
          {t("finalRounded", { currency: data.currencyData.base })}
        </div>
      </div>
    </section>
  </div>
  <div class="col-12 col-md-6">
    <section class="card border-0 shadow-sm h-100">
      <div class="card-header bg-body border-0 px-4 pt-4 pb-2">
        <h2 class="h5 mb-1"><i class="bi bi-cash-stack text-success me-2"></i>{t("totalsByCurrency")}</h2>
        <p class="small text-body-secondary mb-0">{t("noIntermediateRounding")}</p>
      </div>
      <div class="card-body px-4 pb-4"><div class="list-group list-group-flush">
        {#each totals as item (item.currency)}
          <div class="list-group-item px-0 py-3 d-flex align-items-center justify-content-between">
            <span class="badge text-bg-success-subtle text-success-emphasis rounded-pill px-3 py-2">
              {item.currency}
            </span>
            <strong class="fs-5">{new Intl.NumberFormat(locales[$language], {
              style: "currency", currency: item.currency
            }).format(Number(item.amount))}</strong>
          </div>
        {/each}
      </div></div>
    </section>
  </div>
  <div class="col-12 col-md-6">
    <section class="card border-0 shadow-sm h-100">
      <div class="card-header bg-body border-0 px-4 pt-4 pb-2">
        <h2 class="h5 mb-1"><i class="bi bi-graph-up-arrow text-info me-2"></i>{t("currentRates")}</h2>
        <p class="small text-body-secondary mb-0">{t("asOf", { date: formattedDate })}</p>
      </div>
      <div class="card-body px-4 pb-4"><div class="list-group list-group-flush">
        {#each totals as item (item.currency)}
          {@const rate = item.currency === data.currencyData.base ? "1" : data.currencyData.rates[item.currency]}
          <div class="list-group-item px-0 py-3 d-flex align-items-center justify-content-between">
            <span class="text-body-secondary">1 {data.currencyData.base}</span>
            <strong>{new Intl.NumberFormat(locales[$language], {
              maximumFractionDigits: 6
            }).format(Number(rate))} <span class="text-info-emphasis">{item.currency}</span></strong>
          </div>
        {/each}
      </div></div>
    </section>
  </div>
</div>
