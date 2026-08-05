# Безопасность

## Окружение и секреты

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
