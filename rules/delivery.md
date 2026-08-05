# Поставка, проверки и завершение

## OpenAI Sites

- Сохраняй `.openai/hosting.json`, `@sveltejs/adapter-cloudflare` и Workers-совместимый ESM output.
- Не заменяй текущий `scripts/prepare-sites-build.mjs` без проверки структуры `dist/server` и `dist/client`.
- D1, R2, authentication и другие Sites bindings добавляй только в рамках отдельной согласованной задачи с обновлением архитектуры.

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
