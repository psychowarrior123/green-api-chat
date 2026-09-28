import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

describe("main user journey", () => {
  it("connects, creates a chat, sends text, keeps failed draft, receives a reply and logs out", async () => {
    const user = userEvent.setup();
    let receive: ((value: Response) => void) | undefined;
    let sendCount = 0;
    const fetcher = vi.fn<typeof fetch>(async (input, options) => {
      const url = String(input);
      const json = (data: unknown) => new Response(JSON.stringify(data));
      if (url.includes("/getStateInstance/"))
        return json({ stateInstance: "authorized" });
      if (url.includes("/getSettings/"))
        return json({
          typeInstance: "telegram",
          incomingWebhook: "yes",
          webhookUrl: "",
          outgoingWebhook: "yes",
          outgoingAPIMessageWebhook: "yes",
        });
      if (url.includes("/checkAccount/"))
        return json({ exist: true, chatId: "123", username: "@anna" });
      if (url.includes("/sendMessage/")) {
        sendCount++;
        return sendCount === 1
          ? new Response("", { status: 429 })
          : json({ idMessage: "1" });
      }
      if (url.includes("/deleteNotification/")) return json({ result: true });
      return new Promise<Response>((resolve, reject) => {
        receive = resolve;
        options?.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      });
    });
    vi.stubGlobal("fetch", fetcher);
    render(<App />);
    await user.type(
      screen.getByLabelText("API URL"),
      "https://4100.api.green-api.com",
    );
    await user.type(screen.getByLabelText("ID инстанса"), "4100000000");
    await user.type(screen.getByLabelText("Токен инстанса"), "test-token");
    await user.click(screen.getByRole("button", { name: "Подключиться" }));
    await user.type(
      await screen.findByRole("textbox", { name: "Номер телефона" }),
      "+7 999 123-45-67",
    );
    await user.click(screen.getByRole("button", { name: "Создать чат" }));
    const composer = await screen.findByLabelText("Текст сообщения");
    Object.defineProperty(composer, "scrollHeight", {
      get: () => ((composer as HTMLTextAreaElement).value ? 144 : 43),
    });
    await user.type(composer, "Привет!");
    expect(composer).toHaveStyle({ height: "144px" });
    await user.click(
      screen.getByRole("button", { name: "Отправить сообщение" }),
    );
    await screen.findByText("Слишком много запросов. Подождите немного.");
    expect(composer).toHaveValue("Привет!");
    await user.click(
      screen.getByRole("button", { name: "Отправить сообщение" }),
    );
    await waitFor(() => expect(composer).toHaveValue(""));
    expect(composer).toHaveStyle({ height: "43px" });
    const messages = screen.getByRole("log");
    Object.defineProperties(messages, {
      scrollHeight: { value: 1000 },
      clientHeight: { value: 300 },
    });
    messages.scrollTop = 400;
    fireEvent.scroll(messages);
    expect(messages.scrollTop).toBe(400);
    expect(screen.getByRole("button", { name: "К последним" })).toBeVisible();
    receive?.(
      new Response(
        JSON.stringify({
          receiptId: 7,
          body: {
            typeWebhook: "incomingMessageReceived",
            idMessage: "2",
            timestamp: 1780000000,
            senderData: { chatId: "123", chatName: "Анна" },
            messageData: {
              typeMessage: "textMessage",
              textMessageData: { textMessage: "Привет из Telegram!" },
            },
          },
        }),
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole("log")).toHaveTextContent("Привет из Telegram!"),
    );
    expect(messages.scrollTop).toBe(400);
    await user.click(screen.getByRole("button", { name: "К последним" }));
    expect(messages.scrollTop).toBe(1000);
    await waitFor(() =>
      expect(
        fetcher.mock.calls.some(([url]) =>
          String(url).includes("/deleteNotification/"),
        ),
      ).toBe(true),
    );
    await waitFor(() =>
      expect(
        fetcher.mock.calls.filter(([url]) =>
          String(url).includes("/receiveNotification/"),
        ).length,
      ).toBeGreaterThan(1),
    );
    receive?.(
      new Response(
        JSON.stringify({
          receiptId: 8,
          body: {
            typeWebhook: "outgoingMessageStatus",
            chatId: "123",
            status: "failed",
            description: "Не удалось доставить сообщение",
          },
        }),
      ),
    );
    expect(await screen.findAllByRole("alert")).toHaveLength(1);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Не удалось доставить сообщение",
    );
    await user.click(screen.getByRole("button", { name: "Выйти" }));
    expect(await screen.findByLabelText("Токен инстанса")).toHaveValue("");
    expect(screen.queryByRole("log")).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
