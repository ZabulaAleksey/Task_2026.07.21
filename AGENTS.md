# Инструкции репозитория Task_Module1 — ветка `svelte`

## Язык и область действия

- Общайся с пользователем и веди проектную документацию на русском языке.
- Эти правила действуют для всего репозитория ветки `svelte`.
- Перед задачами, меняющими архитектуру, стек, структуру каталогов или связи модулей, полностью прочитай `architecture.md`.
- Не смешивай изменения этой ветки с checkout `main` или другими worktree.

## Зафиксированный стек

- Используй Node.js 24.18 LTS и npm 12, указанные в `.nvmrc`, `.node-version`, `package.json` и lockfile.
- Устанавливай зависимости через `npm ci`; сохраняй `package-lock.json`.
- Сохраняй SvelteKit 2, Svelte 5 runes, TypeScript 6, Vite, Vitest, Playwright и `@sveltejs/adapter-cloudflare` как согласованный toolchain.
- Не переходи на новую major-версию Vite, TypeScript, SvelteKit или Svelte без отдельной задачи, проверки peer dependencies и полного набора тестов.
- Перед добавлением production-зависимости обязательно запроси подтверждение пользователя.
- Не запускай `npm audit fix --force`. Исправляй advisories точечными совместимыми обновлениями или проверенными overrides.
- Не добавляй `@sveltejs/adapter-auto`: production target этого репозитория — Cloudflare Workers/OpenAI Sites.

## Безопасность окружения и секретов

- Любая переменная `PUBLIC_*` доступна браузеру. Никогда не помещай в неё API key, token, пароль, cookie secret или другие credentials.
- Серверные секреты импортируй только из `$env/static/private` или `$env/dynamic/private` в server-only модулях.
- При добавлении или удалении env-переменной синхронно обновляй `.env.example`, `README.md`, `architecture.md` и `progress.md`. Значения секретов не документируй.
- Не коммить `.env`, локальные credentials, дампы, логи или приватные ключи.
- Для внешнего market provider с секретной авторизацией используй доверенный backend/BFF; не передавай token в WebSocket URL.

## HTTP и SvelteKit

- Не ослабляй CSP и security headers в `svelte.config.js` и `src/hooks.server.ts` без явного обоснования и security-тестов.
- Не добавляй `unsafe-eval`; `unsafe-inline` допускается только после отдельного review и при отсутствии безопасной nonce/hash-альтернативы.
- Сохраняй SvelteKit CSRF origin check. Не используй `trustedOrigins: ["*"]`.
- Персональные финансовые ответы должны требовать server-side authentication и authorization и отправляться с `Cache-Control: no-store`.
- Не используй `{@html}`, `innerHTML`, `eval` или `new Function` для внешних данных. Если HTML действительно необходим, сначала добавь проверенную sanitization-границу и тесты.
- Не доверяй входящему Host/Origin для canonical URLs: используй валидированный `PUBLIC_SITE_URL` в production.
- Production-логи должны быть структурированными и не содержать request headers, cookies, tokens, полные upstream payload или необработанный объект ошибки.

## Realtime и входные данные

- Считай WebSocket и HTTP payload недоверенными до успешной Zod-валидации.
- Production WebSocket должен использовать `wss://`; `ws://` разрешён только для `localhost` и `127.0.0.1`.
- Сохраняй лимит WebSocket-сообщения не выше 64 КБ, bounded queues, лимит последовательных невалидных сообщений и остановку соединения при protocol violation.
- Snapshot-массивы, строки, timestamps, sequence и decimal values должны иметь явные верхние границы.
- Для котировок проверяй `ask >= bid`; для свечей — `low <= open/close <= high`.
- Не применяй событие с `sequence <= lastSequence`, включая устаревший snapshot.
- При изменении realtime-протокола синхронно обновляй Zod-схему, типы, demo generator, state reducer, README, architecture и unit-тесты.
- На стороне будущего BFF обязательно проверяй WebSocket Origin allowlist, authentication, session expiry, per-message authorization и rate limits.

## Типы и финансовые вычисления

- Выводи типы внешних данных из Zod-схем; не создавай параллельные ручные интерфейсы для того же контракта.
- Денежные суммы и курсы вычисляй через `decimal.js-light`, не через `number`.
- Не применяй промежуточное округление; итоговое округление — `ROUND_HALF_EVEN` по fraction digits валюты.
- Преобразование в `number` допустимо только для визуализации после валидации и не должно участвовать в финансовом результате.

## Sites и поставка

- Сохраняй `.openai/hosting.json`, `@sveltejs/adapter-cloudflare` и Workers-совместимый ESM output.
- Не заменяй текущий `scripts/prepare-sites-build.mjs` без проверки структуры `dist/server` и `dist/client`.
- D1, R2, authentication и другие Sites bindings добавляй только в рамках отдельной согласованной задачи с обновлением архитектуры.
- Не публикуй проект и не изменяй hosted resources без прямого запроса пользователя.

## Обязательные проверки

После изменений TypeScript, JavaScript, Svelte, конфигурации, зависимостей или security policy выполни:

```bash
npm run format
npm run check
npm run lint
npm test
npm run build
npm audit --audit-level=high
```

- Для первого локального E2E-запуска установи браузер: `npx playwright install chromium`.
- Security-изменения сопровождай unit- или E2E-тестом, который проверяет новую границу.
- Не завершай задачу при красной обязательной проверке: исправь проблему либо явно зафиксируй объективный blocker.

## Документация и завершение

- При изменении стека, структуры или связей модулей обновляй `architecture.md` в той же задаче.
- После любой задачи с изменением файлов добавляй новый датированный раздел в `progress.md`; предыдущие записи не перезаписывай.
- В `progress.md` перечисляй файлы, проверки и результаты, решения, ограничения, следующий шаг и только названия новых env-переменных.
- Перед завершением проверь `git status`, `git diff --check` и отсутствие случайных секретов.
