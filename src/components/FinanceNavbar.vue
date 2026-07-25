<script setup lang="ts">
import { language, translate } from "../lib/i18n";
import type { Theme } from "../lib/types";
import FinanceLogo from "./FinanceLogo.vue";

defineProps<{ theme: Theme }>();
defineEmits<{ toggleTheme: [] }>();
const languageLabels = { en: "EN", ru: "RU", uk: "UA" } as const;
</script>

<template>
  <nav class="navbar bg-body border-bottom shadow-sm">
    <div class="container gap-2">
      <span class="navbar-brand me-auto py-0"><FinanceLogo /></span>
      <label class="visually-hidden" for="language">{{ translate("language") }}</label>
      <select id="language" v-model="language" class="form-select form-select-sm w-auto"
        :aria-label="translate('language')">
        <option v-for="(label, value) in languageLabels" :key="value" :value="value">{{ label }}</option>
      </select>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('toggleTheme')"
        :aria-label="theme === 'light' ? translate('darkTheme') : translate('lightTheme')">
        <i :class="theme === 'light' ? 'bi bi-moon-stars' : 'bi bi-sun'"></i>
        <span class="d-none d-sm-inline ms-2">
          {{ theme === "light" ? translate("darkTheme") : translate("lightTheme") }}
        </span>
      </button>
    </div>
  </nav>
</template>
