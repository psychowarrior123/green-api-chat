import { describe, expect, it, vi } from "vitest";
import {
  ApiError,
  GreenApi,
  normalizePhone,
  validateCredentials,
} from "./green-api";
const credentials = {
  apiUrl: "https://4100.api.green-api.com",
  idInstance: "4100000000",
  apiTokenInstance: "test-token",
};
const response = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status });

describe("input validation", () => {
  it("normalizes international phone formatting", () =>
    expect(normalizePhone("+7 (999) 123-45-67")).toBe("79991234567"));
  it("rejects an arbitrary token recipient and URL credentials", () => {
    expect(() =>
      validateCredentials({
        ...credentials,
        apiUrl: "https://green-api.com.evil.test",
      }),
    ).toThrow();
    expect(() =>
      validateCredentials({
        ...credentials,
        apiUrl: "https://secret@green-api.com",
      }),
    ).toThrow();
    expect(() => normalizePhone("7999test1234567")).toThrow();
  });
});

describe("GREEN-API client", () => {
  it("preserves the browser receiver when using native fetch", async () => {
    const fetcher = vi.fn(function (this: unknown) {
      if (this !== globalThis) throw new TypeError("Illegal invocation");
      return Promise.resolve(response(null));
    });
    vi.stubGlobal("fetch", fetcher);

    try {
      await expect(new GreenApi(credentials).receive()).resolves.toBeNull();
      expect(fetcher).toHaveBeenCalledTimes(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("resolves a phone to the canonical Telegram ID", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        response({ exist: true, chatId: "123", username: "@anna" }),
      );
    const contact = await new GreenApi(credentials, fetcher).findContact(
      "+7 999 123-45-67",
    );
    expect(contact.chatId).toBe("123");
    expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({
      phoneNumber: 79991234567,
    });
  });
  it("reports logical failures even with HTTP 200", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        response({ status: false, data: { reason: "rate_limit_exceeded" } }),
      );
    await expect(
      new GreenApi(credentials, fetcher).findContact("79991234567"),
    ).rejects.toThrow("ограничил");
  });
  it.each([401, 403])(
    "preserves authorization code %i from an HTTP 200 response",
    async (code) => {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(response({ code }));

      await expect(
        new GreenApi(credentials, fetcher).receive(),
      ).rejects.toMatchObject({ status: code });
    },
  );
  it("reports hidden/unavailable numbers honestly", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ exist: false, chatId: "" }));
    await expect(
      new GreenApi(credentials, fetcher).findContact("79991234567"),
    ).rejects.toThrow("приватности");
  });
  it("handles an empty queue without a JSON parse failure", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(""));
    await expect(
      new GreenApi(credentials, fetcher).receive(),
    ).resolves.toBeNull();
  });
  it("does not retry POST on ambiguous network failure", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError("network"));
    await expect(
      new GreenApi(credentials, fetcher).sendMessage("123", "Привет"),
    ).rejects.toMatchObject({ uncertain: true });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("classifies a temporary restart as retryable and does not expose response data", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("instance in starting process try later test-token", {
        status: 400,
      }),
    );
    const error = await new GreenApi(credentials, fetcher)
      .receive()
      .catch((e) => e as ApiError);
    expect(error).toMatchObject({ status: 503 });
    expect((error as ApiError).message).not.toContain("test-token");
  });
  it("checks instance type and incoming settings before opening a session", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response({ stateInstance: "authorized" }))
      .mockResolvedValueOnce(
        response({
          typeInstance: "telegram",
          incomingWebhook: "no",
          webhookUrl: "",
        }),
      );
    await expect(new GreenApi(credentials, fetcher).connect()).rejects.toThrow(
      "входящих",
    );
  });
});
