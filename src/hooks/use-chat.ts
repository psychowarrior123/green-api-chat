import { useEffect, useReducer, useRef, useState } from "react";
import { ApiError, GreenApi } from "../api/green-api";
import type { Contact } from "../api/green-api";
import {
  chatReducer,
  initialState,
  notificationAction,
} from "../chat/chat-model";
import { pollNotifications } from "../chat/polling";
import type { Connection } from "../chat/polling";

export function useChat(api: GreenApi) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [connection, setConnection] = useState<Connection>({ state: "online" });
  const [notice, setNotice] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<Set<string>>(new Set());
  const pending = useRef(new Set<string>());
  const lifetime = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    lifetime.current = controller;
    const run = () =>
      pollNotifications(
        api,
        controller.signal,
        (body) => {
          const action = notificationAction(body);
          if (action) dispatch(action);
          if (
            !action &&
            body.typeWebhook === "outgoingMessageStatus" &&
            !body.idMessage &&
            ["failed", "noAccount"].includes(String(body.status))
          )
            setNotice(
              String(
                body.description ??
                  "Telegram не смог отправить сообщение в этот чат.",
              ),
            );
          if (
            body.typeWebhook === "stateInstanceChanged" &&
            body.stateInstance !== "authorized"
          ) {
            if (body.stateInstance === "starting") return;
            setConnection({
              state: "stopped",
              message:
                "Состояние инстанса изменилось. Проверьте авторизацию в кабинете GREEN-API и подключитесь заново.",
            });
            return false;
          }
          if (body.typeWebhook === "quotaExceeded")
            setNotice(
              "Достигнут лимит тарифа. Проверьте ограничения в личном кабинете GREEN-API.",
            );
        },
        setConnection,
      );
    // Only one tab on this origin may consume this instance's queue.
    if (navigator.locks) {
      void navigator.locks
        .request(
          `green-api-telegram-${api.instanceId}`,
          { ifAvailable: true },
          async (lock) => {
            if (controller.signal.aborted) return;
            if (!lock) {
              setConnection({
                state: "stopped",
                message:
                  "Этот инстанс уже открыт в другой вкладке. Закройте её и подключитесь заново.",
              });
              return;
            }
            await run();
          },
        )
        .catch(() => {
          if (!controller.signal.aborted)
            setConnection({
              state: "stopped",
              message:
                "Не удалось начать получение сообщений. Подключитесь заново.",
            });
        });
    } else {
      void run();
    }
    return () => {
      controller.abort();
      lifetime.current = null;
    };
  }, [api]);

  async function openChat(phone: string) {
    const signal = lifetime.current?.signal;
    if (!signal || signal.aborted) return;
    const digits = phone.replace(/\D/g, "");
    const existing = state.chats.find((chat) => chat.phone === digits);
    const contact = existing ?? (await api.findContact(phone, signal));
    if (!signal.aborted) dispatch({ type: "open", contact });
  }

  async function send(contact: Contact, text: string) {
    const signal = lifetime.current?.signal;
    if (
      !signal ||
      signal.aborted ||
      pending.current.has(contact.chatId) ||
      !text.trim()
    )
      return;
    const temporaryId = `local-${crypto.randomUUID()}`;
    pending.current.add(contact.chatId);
    setSending(new Set(pending.current));
    dispatch({
      type: "message",
      contact,
      message: {
        id: temporaryId,
        text,
        outgoing: true,
        timestamp: Date.now(),
        status: "sending",
      },
    });
    try {
      const id = await api.sendMessage(contact.chatId, text, signal);
      if (signal.aborted) return;
      dispatch({ type: "accepted", chatId: contact.chatId, temporaryId, id });
      setDrafts((current) =>
        current[contact.chatId] === text
          ? { ...current, [contact.chatId]: "" }
          : current,
      );
    } catch (error) {
      if (signal.aborted) return;
      dispatch({
        type: "sendError",
        chatId: contact.chatId,
        id: temporaryId,
        error:
          error instanceof Error
            ? error.message
            : "Не удалось отправить сообщение.",
        uncertain: error instanceof ApiError && error.uncertain,
      });
    } finally {
      pending.current.delete(contact.chatId);
      if (!signal.aborted) setSending(new Set(pending.current));
    }
  }

  return {
    state,
    connection,
    notice,
    dismissNotice: () => setNotice(""),
    dismissChatError: (chatId: string) =>
      dispatch({ type: "clearChatError", chatId }),
    drafts,
    sending,
    openChat,
    send,
    setDraft: (chatId: string, value: string) =>
      setDrafts((current) => ({ ...current, [chatId]: value })),
    select: (chatId: string | null) => dispatch({ type: "select", chatId }),
  };
}
