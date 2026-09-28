import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/green-api";
import { pollNotifications } from "./polling";
import type { QueueApi } from "./polling";

describe("notification queue", () => {
  it("acknowledges unsupported events so they cannot block following messages", async () => {
    const controller = new AbortController();
    const process = vi.fn();
    const api: QueueApi = {
      receive: vi.fn().mockResolvedValue({
        receiptId: 42,
        body: { typeWebhook: "unsupported" },
      }),
      acknowledge: vi.fn(async () => {
        controller.abort();
      }),
    };
    await pollNotifications(api, controller.signal, process, vi.fn());
    expect(process).toHaveBeenCalledBefore(
      api.acknowledge as ReturnType<typeof vi.fn>,
    );
    expect(api.acknowledge).toHaveBeenCalledWith(42, controller.signal);
  });
  it("does not handle a late response after logout", async () => {
    const controller = new AbortController();
    const process = vi.fn();
    const api: QueueApi = {
      receive: vi.fn(async () => {
        controller.abort();
        return { receiptId: 42, body: {} };
      }),
      acknowledge: vi.fn(),
    };
    await pollNotifications(api, controller.signal, process, vi.fn());
    expect(process).not.toHaveBeenCalled();
    expect(api.acknowledge).not.toHaveBeenCalled();
  });
  it("stops for invalid credentials without spinning requests", async () => {
    const report = vi.fn();
    const api: QueueApi = {
      receive: vi.fn().mockRejectedValue(new ApiError("Unauthorized", 401)),
      acknowledge: vi.fn(),
    };
    await pollNotifications(api, new AbortController().signal, vi.fn(), report);
    expect(api.receive).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledWith({
      state: "stopped",
      message: "Unauthorized",
    });
  });
});
