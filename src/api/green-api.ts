export interface Credentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}
interface Settings {
  typeInstance?: string;
  incomingWebhook?: string;
  webhookUrl?: string;
  outgoingWebhook?: string;
  outgoingAPIMessageWebhook?: string;
}
export interface Receipt {
  receiptId: number;
  body: Record<string, unknown>;
}
export interface Contact {
  chatId: string;
  phone: string;
  name: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status = 0,
    public readonly uncertain = false,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export const object = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export function normalizePhone(value: string): string {
  if (/[^\d\s()+-]/.test(value))
    throw new Error("Введите номер телефона в международном формате.");
  const digits = value.replace(/\D/g, "");
  if (!/^[1-9]\d{6,14}$/.test(digits))
    throw new Error("Укажите код страны и номер: от 7 до 15 цифр.");
  return digits;
}

export function validateCredentials(input: Credentials): Credentials {
  const idInstance = input.idInstance.trim();
  const apiTokenInstance = input.apiTokenInstance.trim();
  if (!/^\d+$/.test(idInstance))
    throw new Error("ID инстанса должен содержать только цифры.");
  if (!/^[a-zA-Z0-9_-]+$/.test(apiTokenInstance))
    throw new Error(
      "Проверьте токен инстанса: он не должен содержать пробелы.",
    );
  let url: URL;
  try {
    url = new URL(input.apiUrl.trim());
  } catch {
    throw new Error("Скопируйте полный API URL из личного кабинета.");
  }
  if (
    url.protocol !== "https:" ||
    !/(^|\.)green-api\.com$/.test(url.hostname) ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error(
      "API URL должен быть HTTPS-адресом GREEN-API, например https://4100.api.green-api.com.",
    );
  }
  return { apiUrl: url.origin, idInstance, apiTokenInstance };
}

function httpMessage(status: number): string {
  if (status === 401 || status === 403)
    return "Доступ отклонён. Проверьте API URL, ID и токен инстанса.";
  if (status === 429) return "Слишком много запросов. Подождите немного.";
  if (status === 466)
    return "Достигнут лимит тарифа GREEN-API. Проверьте лимиты в кабинете.";
  if (status === 469)
    return "Telegram временно ограничил запросы. Повторите попытку позже.";
  if (status === 400)
    return "GREEN-API отклонил запрос. Проверьте настройки инстанса и введённые данные.";
  if (status >= 500) return "GREEN-API временно недоступен. Попробуйте позже.";
  return `Не удалось выполнить запрос (HTTP ${status}).`;
}

export class GreenApi {
  readonly instanceId: string;
  private readonly credentials: Credentials;
  constructor(
    credentials: Credentials,
    private readonly fetcher: typeof fetch = fetch.bind(globalThis),
  ) {
    this.credentials = validateCredentials(credentials);
    this.instanceId = this.credentials.idInstance;
  }

  private async request(
    method: string,
    options: {
      verb?: string;
      body?: unknown;
      suffix?: string;
      signal?: AbortSignal;
      sending?: boolean;
    } = {},
  ): Promise<unknown> {
    const { apiUrl, idInstance, apiTokenInstance } = this.credentials;
    const controller = new AbortController();
    const abort = () => controller.abort();
    options.signal?.addEventListener("abort", abort, { once: true });
    if (options.signal?.aborted) controller.abort();
    const timeout = setTimeout(abort, 40_000);
    try {
      const response = await this.fetcher(
        `${apiUrl}/waInstance${idInstance}/${method}/${apiTokenInstance}${options.suffix ?? ""}`,
        {
          method: options.verb ?? "GET",
          ...(options.body === undefined
            ? {}
            : {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(options.body),
              }),
          signal: controller.signal,
          cache: "no-store",
          credentials: "omit",
          referrerPolicy: "no-referrer",
        },
      );
      if (!response.ok) {
        // Read the reason only to classify known transient errors; never echo raw responses containing credentials.
        const reason = await response.text();
        const restarting =
          response.status === 400 && /starting process|try later/i.test(reason);
        throw new ApiError(
          restarting
            ? "Инстанс перезапускается. Подождите немного."
            : httpMessage(response.status),
          restarting ? 503 : response.status,
          Boolean(options.sending && response.status >= 500),
        );
      }
      const text = await response.text();
      if (!text.trim()) return null;
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        throw new ApiError(
          "GREEN-API вернул неожиданный ответ.",
          0,
          options.sending,
        );
      }
      const record = object(data);
      if (
        record.status === false ||
        record.code === 401 ||
        record.code === 403
      ) {
        const reason = String(
          record.reason ?? object(record.data).reason ?? "",
        );
        throw new ApiError(
          reason.includes("rate")
            ? "Telegram временно ограничил поиск по номеру. Попробуйте позже."
            : "Операция отклонена. Проверьте авторизацию и ограничения инстанса.",
          record.code === 401 || record.code === 403 ? record.code : 0,
        );
      }
      return data;
    } catch (error) {
      if (options.signal?.aborted)
        throw new DOMException("Aborted", "AbortError");
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        options.sending
          ? "Результат отправки неизвестен. Проверьте чат в Telegram перед повтором, чтобы не отправить дубль."
          : "Нет ответа от GREEN-API. Проверьте интернет и API URL.",
        0,
        options.sending,
      );
    } finally {
      clearTimeout(timeout);
      options.signal?.removeEventListener("abort", abort);
    }
  }

  async connect(signal?: AbortSignal): Promise<string[]> {
    const state = object(
      await this.request("getStateInstance", { signal }),
    ).stateInstance;
    const descriptions: Record<string, string> = {
      notAuthorized:
        "Авторизуйте Telegram-инстанс в кабинете GREEN-API по QR-коду.",
      pendingPassword:
        "Завершите двухэтапную авторизацию Telegram в кабинете GREEN-API.",
      starting:
        "Инстанс запускается. Подождите около минуты и подключитесь снова.",
      blocked:
        "Аккаунт заблокирован. Проверьте его состояние в кабинете GREEN-API.",
      suspended: "Работа инстанса приостановлена. Проверьте кабинет GREEN-API.",
    };
    if (state !== "authorized")
      throw new ApiError(
        descriptions[String(state)] ??
          "Инстанс не готов к работе. Проверьте его состояние в кабинете GREEN-API.",
      );
    const settings = object(
      await this.request("getSettings", { signal }),
    ) as Settings;
    if (settings.typeInstance !== "telegram")
      throw new ApiError(
        "Этот инстанс не относится к Telegram. Выберите Telegram-инстанс.",
      );
    if (settings.webhookUrl?.trim())
      throw new ApiError(
        "Для получения сообщений очистите Webhook URL в настройках инстанса и подождите около минуты.",
      );
    if (settings.incomingWebhook !== "yes")
      throw new ApiError(
        "Включите «Получать уведомления о входящих сообщениях» в настройках инстанса.",
      );
    return settings.outgoingWebhook !== "yes" ||
      settings.outgoingAPIMessageWebhook !== "yes"
      ? [
          "Статусы доставки могут не обновляться. Включите outgoingWebhook и outgoingAPIMessageWebhook в кабинете GREEN-API.",
        ]
      : [];
  }

  async findContact(
    phoneInput: string,
    signal?: AbortSignal,
  ): Promise<Contact> {
    const phone = normalizePhone(phoneInput);
    const result = object(
      await this.request("checkAccount", {
        verb: "POST",
        body: { phoneNumber: Number(phone) },
        signal,
      }),
    );
    if (
      result.exist !== true ||
      typeof result.chatId !== "string" ||
      !result.chatId
    ) {
      throw new ApiError(
        "Номер не найден или скрыт настройками приватности Telegram. Проверьте номер и доступность поиска у получателя.",
      );
    }
    return {
      chatId: result.chatId,
      phone,
      name:
        typeof result.username === "string" && result.username
          ? result.username
          : `+${phone}`,
    };
  }

  async sendMessage(
    chatId: string,
    message: string,
    signal?: AbortSignal,
  ): Promise<string> {
    if (!message.trim() || message.length > 4096)
      throw new ApiError("Сообщение должно содержать от 1 до 4096 символов.");
    const result = object(
      await this.request("sendMessage", {
        verb: "POST",
        body: { chatId, message },
        signal,
        sending: true,
      }),
    );
    if (typeof result.idMessage !== "string" || !result.idMessage)
      throw new ApiError(
        "Нет подтверждения отправки. Проверьте чат в Telegram перед повтором.",
        0,
        true,
      );
    return result.idMessage;
  }

  async receive(signal?: AbortSignal): Promise<Receipt | null> {
    const data = await this.request("receiveNotification", {
      suffix: "?receiveTimeout=25",
      signal,
    });
    if (data === null) return null;
    const record = object(data);
    if (!Number.isSafeInteger(record.receiptId))
      throw new ApiError("Некорректное уведомление от GREEN-API.");
    return { receiptId: record.receiptId as number, body: object(record.body) };
  }

  async acknowledge(receiptId: number, signal?: AbortSignal): Promise<void> {
    const data = object(
      await this.request("deleteNotification", {
        verb: "DELETE",
        suffix: `/${receiptId}`,
        signal,
      }),
    );
    // A receipt may already have been removed after an interrupted response.
    if (typeof data.result !== "boolean")
      throw new ApiError("Не удалось подтвердить обработку уведомления.");
  }
}
