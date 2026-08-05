# Toolchain и зависимости

## Зафиксированный стек

- Используй Node.js 24.18 LTS и npm 12, указанные в `.nvmrc`, `.node-version`, `package.json` и lockfile.
- Устанавливай зависимости через `npm ci`; сохраняй `package-lock.json`.
- Сохраняй SvelteKit 2, Svelte 5 runes, TypeScript 6, Vite, Vitest, Playwright и `@sveltejs/adapter-cloudflare` как согласованный toolchain.
- Не переходи на новую major-версию Vite, TypeScript, SvelteKit или Svelte без отдельной задачи, проверки peer dependencies и полного набора тестов.
- Не запускай `npm audit fix --force`. Исправляй advisories точечными совместимыми обновлениями или проверенными overrides.
- Не добавляй `@sveltejs/adapter-auto`: production target этого репозитория — Cloudflare Workers/OpenAI Sites.
