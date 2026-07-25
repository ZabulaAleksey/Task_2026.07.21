<script lang="ts">
  import { language, translate } from "../lib/i18n";

  let { error, isLoading, onSubmit }: {
    error: string | null;
    isLoading: boolean;
    onSubmit: (apiKey: string) => void;
  } = $props();
  let apiKey = $state("");
  let showApiKey = $state(false);
  let validationError = $state<string | null>(null);
  const t = (key: Parameters<typeof translate>[1]) => translate($language, key);

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const key = apiKey.trim();
    if (!key) {
      validationError = t("apiKeyRequired");
      return;
    }
    validationError = null;
    onSubmit(key);
  }
</script>

<section class="card border-0 shadow">
  <div class="card-body p-4 p-md-5">
    <h1 class="h3 mb-2">{t("formTitle")}</h1>
    <p class="text-body-secondary mb-4">{t("formDescription")}</p>
    <form onsubmit={submit}>
      <label for="apiKey" class="form-label fw-semibold">{t("apiKey")}</label>
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-key"></i></span>
        <input id="apiKey" type={showApiKey ? "text" : "password"} class="form-control"
          placeholder={t("apiKeyPlaceholder")} bind:value={apiKey} autocomplete="off"
          disabled={isLoading} aria-invalid={Boolean(validationError ?? error)} />
        <button type="button" class="btn btn-outline-secondary" onclick={() => showApiKey = !showApiKey}
          aria-label={showApiKey ? "Hide" : "Show"}>
          <i class={showApiKey ? "bi bi-eye-slash" : "bi bi-eye"}></i>
        </button>
      </div>
      <div class="form-text">{t("apiKeyHelp")}</div>
      <button type="submit" class="btn btn-primary w-100 mt-4" disabled={isLoading}>
        {#if isLoading}
          <span class="spinner-border spinner-border-sm me-2"></span>{t("loading")}
        {:else}
          <i class="bi bi-send me-2"></i>{t("submit")}
        {/if}
      </button>
    </form>
    {#if validationError ?? error}
      <div class="alert alert-danger mt-4 mb-0" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>{validationError ?? error}
      </div>
    {/if}
  </div>
</section>
