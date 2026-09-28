import { object } from "../api/green-api";
import type { Contact } from "../api/green-api";

export type Delivery =
  "sending" | "queued" | "delivered" | "read" | "failed" | "unknown";
export interface Message {
  id: string;
  text: string;
  timestamp: number;
  outgoing: boolean;
  status: Delivery;
  error?: string;
}
export interface Chat extends Contact {
  messages: Message[];
  unread: number;
}
export interface ChatState {
  chats: Chat[];
  activeId: string | null;
  statuses: Record<string, Delivery>;
  chatErrors: Record<string, string>;
}
export const initialState: ChatState = {
  chats: [],
  activeId: null,
  statuses: {},
  chatErrors: {},
};
const messageKey = (chatId: string, id: string) => JSON.stringify([chatId, id]);
export type ChatAction =
  | { type: "open"; contact: Contact }
  | { type: "select"; chatId: string | null }
  | { type: "message"; contact: Contact; message: Message }
  | { type: "accepted"; chatId: string; temporaryId: string; id: string }
  | {
      type: "sendError";
      chatId: string;
      id: string;
      error: string;
      uncertain: boolean;
    }
  | { type: "chatError"; chatId: string; error: string }
  | { type: "clearChatError"; chatId: string }
  | { type: "delivery"; chatId: string; id: string; status: Delivery };

function advance(previous: Delivery | undefined, next: Delivery): Delivery {
  if (
    previous === "read" ||
    (previous === "delivered" && (next === "queued" || next === "sending"))
  )
    return previous;
  if (previous === "failed" && (next === "queued" || next === "sending"))
    return previous;
  return next;
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  if (action.type === "select") {
    if (
      state.activeId === action.chatId &&
      !state.chats.some((c) => c.chatId === action.chatId && c.unread > 0)
    )
      return state;
    return {
      ...state,
      activeId: action.chatId,
      chats: state.chats.map((c) =>
        c.chatId === action.chatId ? { ...c, unread: 0 } : c,
      ),
    };
  }
  if (action.type === "open") {
    const found = state.chats.some((c) => c.chatId === action.contact.chatId);
    return {
      ...state,
      activeId: action.contact.chatId,
      chats: found
        ? state.chats.map((c) =>
            c.chatId === action.contact.chatId
              ? { ...c, ...action.contact, unread: 0 }
              : c,
          )
        : [{ ...action.contact, messages: [], unread: 0 }, ...state.chats],
    };
  }
  if (action.type === "chatError") {
    return {
      ...state,
      chatErrors: { ...state.chatErrors, [action.chatId]: action.error },
      chats: state.chats.map((c) => {
        if (c.chatId !== action.chatId) return c;
        const pending = [...c.messages]
          .reverse()
          .find((m) => m.outgoing && ["sending", "queued"].includes(m.status));
        return pending
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === pending.id
                  ? { ...m, status: "failed", error: action.error }
                  : m,
              ),
            }
          : c;
      }),
    };
  }
  if (action.type === "clearChatError") {
    const { [action.chatId]: _removed, ...chatErrors } = state.chatErrors;
    return { ...state, chatErrors };
  }
  if (action.type === "delivery") {
    const key = messageKey(action.chatId, action.id);
    const status = advance(state.statuses[key], action.status);
    const message = state.chats
      .find((c) => c.chatId === action.chatId)
      ?.messages.find((m) => m.id === action.id);
    if (
      state.statuses[key] === status &&
      (!message || advance(message.status, status) === message.status)
    )
      return state;
    return {
      ...state,
      statuses: { ...state.statuses, [key]: status },
      chats: state.chats.map((c) =>
        c.chatId !== action.chatId
          ? c
          : {
              ...c,
              messages: c.messages.map((m) =>
                m.id === action.id
                  ? { ...m, status: advance(m.status, status) }
                  : m,
              ),
            },
      ),
    };
  }
  if (action.type === "message") {
    const existing = state.chats.find(
      (c) => c.chatId === action.contact.chatId,
    );
    if (existing?.messages.some((m) => m.id === action.message.id))
      return state;
    const message = {
      ...action.message,
      status: advance(
        action.message.status,
        state.statuses[messageKey(action.contact.chatId, action.message.id)] ??
          action.message.status,
      ),
    };
    const chat: Chat = {
      ...(existing ?? { ...action.contact, messages: [], unread: 0 }),
      messages: [...(existing?.messages ?? []), message].sort(
        (a, b) => a.timestamp - b.timestamp,
      ),
      unread:
        (existing?.unread ?? 0) +
        (!message.outgoing && state.activeId !== action.contact.chatId ? 1 : 0),
    };
    const { [chat.chatId]: _cleared, ...chatErrors } = state.chatErrors;
    return {
      ...state,
      chatErrors,
      chats: [chat, ...state.chats.filter((c) => c.chatId !== chat.chatId)],
    };
  }
  return {
    ...state,
    chats: state.chats.map((c) => {
      if (c.chatId !== action.chatId) return c;
      if (action.type === "sendError")
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === action.id
              ? {
                  ...m,
                  status: action.uncertain ? "unknown" : "failed",
                  error: action.error,
                }
              : m,
          ),
        };
      const optimistic = c.messages.find((m) => m.id === action.temporaryId);
      if (!optimistic) return c;
      const echoed = c.messages.find((m) => m.id === action.id);
      const status =
        state.statuses[messageKey(c.chatId, action.id)] ??
        echoed?.status ??
        "queued";
      return {
        ...c,
        messages: c.messages
          .filter((m) => m.id !== action.temporaryId && m.id !== action.id)
          .concat({ ...optimistic, ...echoed, id: action.id, status })
          .sort((a, b) => a.timestamp - b.timestamp),
      };
    }),
  };
}

export function notificationAction(
  body: Record<string, unknown>,
): ChatAction | null {
  if (body.typeWebhook === "outgoingMessageStatus") {
    if (typeof body.chatId !== "string") return null;
    const statuses: Record<string, Delivery> = {
      delivered: "delivered",
      read: "read",
      failed: "failed",
      noAccount: "failed",
    };
    const status = statuses[String(body.status)];
    if (typeof body.idMessage !== "string") {
      if (status === "failed")
        return {
          type: "chatError",
          chatId: body.chatId,
          error:
            typeof body.description === "string" && body.description
              ? body.description
              : "Telegram не смог отправить сообщение в этот чат.",
        };
      return null;
    }
    return status
      ? { type: "delivery", chatId: body.chatId, id: body.idMessage, status }
      : null;
  }
  if (
    ![
      "incomingMessageReceived",
      "outgoingMessageReceived",
      "outgoingAPIMessageReceived",
    ].includes(String(body.typeWebhook))
  )
    return null;
  const sender = object(body.senderData);
  const data = object(body.messageData);
  const text =
    data.typeMessage === "textMessage"
      ? object(data.textMessageData).textMessage
      : data.typeMessage === "extendedTextMessage"
        ? object(data.extendedTextMessageData).text
        : undefined;
  if (
    typeof sender.chatId !== "string" ||
    typeof body.idMessage !== "string" ||
    typeof text !== "string"
  )
    return null;
  // The assignment is limited to direct text conversations.
  if (sender.chatId.startsWith("-")) return null;
  const outgoing = body.typeWebhook !== "incomingMessageReceived";
  const name = [
    sender.chatName,
    sender.senderContactName,
    sender.senderName,
  ].find((x) => typeof x === "string" && x);
  return {
    type: "message",
    contact: {
      chatId: sender.chatId,
      name: typeof name === "string" ? name : sender.chatId,
      phone: sender.senderPhoneNumber ? String(sender.senderPhoneNumber) : "",
    },
    message: {
      id: body.idMessage,
      text,
      timestamp:
        typeof body.timestamp === "number" ? body.timestamp * 1000 : Date.now(),
      outgoing,
      status: outgoing ? "queued" : "delivered",
    },
  };
}
