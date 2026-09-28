import { describe, expect, it } from "vitest";
import { chatReducer, initialState, notificationAction } from "./chat-model";
import type { ChatAction, ChatState } from "./chat-model";

const contact = { chatId: "123", phone: "79991234567", name: "Анна" };
const message = {
  id: "1",
  text: "Привет",
  timestamp: 1000,
  outgoing: true,
  status: "queued" as const,
};
const reduce = (...actions: ChatAction[]) =>
  actions.reduce(chatReducer, initialState);
const add: ChatAction = { type: "message", contact, message };

describe("chat reducer", () => {
  it("deduplicates repeated receipts but keeps identical IDs in different chats", () => {
    const state = reduce(add, add, {
      ...add,
      contact: { ...contact, chatId: "456" },
    });
    expect(state.chats).toHaveLength(2);
    expect(state.chats.map((c) => c.messages.length)).toEqual([1, 1]);
  });
  it("handles a delivery event before the send response and collapses the outgoing echo", () => {
    const state = reduce(
      { ...add, message: { ...message, id: "local-1", status: "sending" } },
      { type: "delivery", chatId: "123", id: "1", status: "read" },
      add,
      { type: "accepted", chatId: "123", temporaryId: "local-1", id: "1" },
      { type: "delivery", chatId: "123", id: "1", status: "delivered" },
    );
    expect(state.chats[0].messages).toHaveLength(1);
    expect(state.chats[0].messages[0].status).toBe("read");
  });
  it("counts only new incoming messages as unread and clears on selecting a chat", () => {
    const incoming: ChatAction = {
      ...add,
      message: { ...message, outgoing: false },
    };
    const state = reduce(incoming, incoming);
    expect(state.chats[0].unread).toBe(1);
    expect(
      chatReducer(state, { type: "select", chatId: "123" }).chats[0].unread,
    ).toBe(0);
  });
  it("keeps state unchanged when selecting the active, read chat", () => {
    const state = reduce(add, { type: "select", chatId: "123" });

    expect(chatReducer(state, { type: "select", chatId: "123" })).toBe(state);
  });
  it("ignores repeated delivery updates but can recover a failed message", () => {
    const delivered: ChatAction = {
      type: "delivery",
      chatId: "123",
      id: "1",
      status: "delivered",
    };
    const state = reduce(add, delivered);

    expect(chatReducer(state, delivered)).toBe(state);

    const failed = chatReducer(state, {
      type: "sendError",
      chatId: "123",
      id: "1",
      error: "Timeout",
      uncertain: true,
    });
    expect(chatReducer(failed, delivered).chats[0].messages[0].status).toBe(
      "delivered",
    );
  });
  it("preserves text and distinguishes unknown send outcomes", () => {
    const state = reduce(add, {
      type: "sendError",
      chatId: "123",
      id: "1",
      error: "Timeout",
      uncertain: true,
    });
    expect(state.chats[0].messages[0]).toMatchObject({
      text: "Привет",
      status: "unknown",
      error: "Timeout",
    });
  });
  it("keeps a chat-level failure when GREEN-API omits idMessage", () => {
    const action = notificationAction({
      typeWebhook: "outgoingMessageStatus",
      chatId: "123",
      status: "failed",
      description: "no account",
    });
    expect(action).toEqual({
      type: "chatError",
      chatId: "123",
      error: "no account",
    });
    const state = reduce(add, action as ChatAction);
    expect(state.chatErrors["123"]).toBe("no account");
    expect(state.chats[0].messages[0].status).toBe("failed");
  });
  it("does not accidentally update an identical message ID in another chat", () => {
    const state: ChatState = reduce(
      add,
      { ...add, contact: { ...contact, chatId: "456" } },
      { type: "delivery", chatId: "123", id: "1", status: "read" },
    );
    expect(
      state.chats.find((c) => c.chatId === "456")?.messages[0].status,
    ).toBe("queued");
  });
});

describe("notification parser", () => {
  const base = {
    typeWebhook: "incomingMessageReceived",
    idMessage: "2",
    timestamp: 100,
    senderData: { chatId: "123", chatName: "Анна" },
  };
  it("parses text with URLs and converts seconds to milliseconds", () => {
    expect(
      notificationAction({
        ...base,
        messageData: {
          typeMessage: "extendedTextMessage",
          extendedTextMessageData: { text: "https://example.com" },
        },
      }),
    ).toMatchObject({
      type: "message",
      message: {
        text: "https://example.com",
        timestamp: 100000,
        outgoing: false,
      },
    });
  });
  it("ignores unsupported content and malformed notifications", () => {
    expect(
      notificationAction({
        ...base,
        messageData: { typeMessage: "imageMessage" },
      }),
    ).toBeNull();
    expect(notificationAction({})).toBeNull();
  });
});
