# GREEN-API Telegram Chat

Тестовый проект на React и TypeScript. Через GREEN-API можно подключить Telegram-инстанс, создать чат по номеру телефона и обмениваться текстовыми сообщениями.

## Запуск

Нужен Node.js 20 или новее.

```bash
npm install
npm run dev
```

Для проверки сборки:

```bash
npm run typecheck
npm test
npm run build
```

Форматирование кода:

```bash
npm run format
```

Prettier использует два пробела, двойные кавычки и переносы длинных строк. Проверить форматирование без изменений можно командой `npm run format:check`.

## Подключение

1. Создайте Telegram-инстанс в [GREEN-API](https://console.green-api.com/) и авторизуйте его по QR-коду.
2. В настройках включите `incomingWebhook = yes`.
3. Оставьте `webhookUrl` пустым, приложение получает уведомления через HTTP API.
4. Вставьте в форму `apiUrl`, `idInstance` и `apiTokenInstance`.
5. Введите номер получателя с кодом страны и создайте чат.

Номер должен быть доступен для поиска в Telegram. Если настройки приватности скрывают аккаунт, GREEN-API вернёт `exist: false`.

## Структура

- `src/api/green-api.ts` — запросы к GREEN-API;
- `src/hooks/use-chat.ts` — подключение очереди сообщений к React;
- `src/chat/chat-model.ts` — состояние чатов и разбор уведомлений;
- `src/chat/polling.ts` — последовательный `receiveNotification` → `deleteNotification`;
- `src/pages` — страницы подключения и чата;
- `src/components` — компоненты интерфейса;
- `src/styles.css` — сброс стилей, общие цвета и анимация загрузки.

Каждая страница и компонент находятся в отдельной папке. Разметка и обработчики — в `.tsx`, styled-components — в соседнем `styles.ts`, публичный экспорт — в `index.ts`. Например:

```text
pages/
  chat-page/
    chat-page.tsx
    styles.ts
    index.ts
```

Внутри компонентов стили импортируются как `S`: `<S.Header>`, `<S.Content>`. Кнопки и аватар состоят только из стилей и экспорта. API и логика сообщений не зависят от компонентов интерфейса.

Токен не сохраняется в `localStorage` и очищается после перезагрузки страницы. История сообщений хранится только в памяти вкладки.

## Методы GREEN-API

- [SendMessage](https://green-api.com/telegram/docs/api/sending/SendMessage/);
- [ReceiveNotification](https://green-api.com/telegram/docs/api/receiving/technology-http-api/ReceiveNotification/);
- [DeleteNotification](https://green-api.com/telegram/docs/api/receiving/technology-http-api/DeleteNotification/).
