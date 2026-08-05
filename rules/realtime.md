# Realtime и входные market-данные

- Считай WebSocket и HTTP payload недоверенными до успешной Zod-валидации.
- Выводи типы внешних данных из Zod-схем; не создавай параллельные ручные интерфейсы для того же контракта.
- Production WebSocket должен использовать `wss://`; `ws://` разрешён только для `localhost` и `127.0.0.1`.
- Сохраняй лимит WebSocket-сообщения не выше 64 КБ, bounded queues, лимит последовательных невалидных сообщений и остановку соединения при protocol violation.
- Snapshot-массивы, строки, timestamps, sequence и decimal values должны иметь явные верхние границы.
- Для котировок проверяй `ask >= bid`; для свечей — `low <= open/close <= high`.
- Не применяй событие с `sequence <= lastSequence`, включая устаревший snapshot.
- При изменении realtime-протокола синхронно обновляй Zod-схему, типы, demo generator, state reducer, README, architecture и unit-тесты.
- На стороне будущего BFF обязательно проверяй WebSocket Origin allowlist, authentication, session expiry, per-message authorization и rate limits.
