<script setup lang="ts">
import { computed, ref } from "vue";
import { translate } from "../lib/i18n";

const props = defineProps<{ error: string | null; isLoading: boolean }>();
const emit = defineEmits<{ submit: [apiKey: string] }>();
const apiKey = ref("");
const showApiKey = ref(false);
const validationError = ref<string | null>(null);
const visibleError = computed(() => validationError.value ?? props.error);

function submit() {
  const key = apiKey.value.trim();
  if (!key) {
    validationError.value = translate("apiKeyRequired");
    return;
  }
  validationError.value = null;
  emit("submit", key);
}
</script>

<template>
  <section class="card border-0 shadow">
    <div class="card-body p-4 p-md-5">
      <h1 class="h3 mb-2">{{ translate("formTitle") }}</h1>
      <p class="text-body-secondary mb-4">{{ translate("formDescription") }}</p>
      <form @submit.prevent="submit">
        <label for="apiKey" class="form-label fw-semibold">{{ translate("apiKey") }}</label>
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-key"></i></span>
          <input id="apiKey" v-model="apiKey" :type="showApiKey ? 'text' : 'password'"
            class="form-control" :placeholder="translate('apiKeyPlaceholder')" autocomplete="off"
            :disabled="isLoading" :aria-invalid="Boolean(visibleError)" />
          <button type="button" class="btn btn-outline-secondary" @click="showApiKey = !showApiKey"
            :aria-label="showApiKey ? 'Hide' : 'Show'">
            <i :class="showApiKey ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
        <div class="form-text">{{ translate("apiKeyHelp") }}</div>
        <button type="submit" class="btn btn-primary w-100 mt-4" :disabled="isLoading">
          <template v-if="isLoading">
            <span class="spinner-border spinner-border-sm me-2"></span>{{ translate("loading") }}
          </template>
          <template v-else><i class="bi bi-send me-2"></i>{{ translate("submit") }}</template>
        </button>
      </form>
      <div v-if="visibleError" class="alert alert-danger mt-4 mb-0" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ visibleError }}
      </div>
    </div>
  </section>
</template>
