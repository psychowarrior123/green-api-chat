import { ApiError } from "../api/green-api";
import type { Receipt } from "../api/green-api";

export type Connection = {
  state: "online" | "reconnecting" | "stopped";
  message?: string;
};
export interface QueueApi {
  receive(signal?: AbortSignal): Promise<Receipt | null>;
  acknowledge(id: number, signal?: AbortSignal): Promise<void>;
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timer = setTimeout(finish, ms);
    signal.addEventListener("abort", finish, { once: true });
  });
}

export async function pollNotifications(
  api: QueueApi,
  signal: AbortSignal,
  process: (body: Record<string, unknown>) => void | boolean,
  report: (connection: Connection) => void,
): Promise<void> {
  let failures = 0;
  while (!signal.aborted) {
    try {
      const receipt = await api.receive(signal);
      if (signal.aborted) break;
      if (receipt) {
        const keepRunning = process(receipt.body);
        await api.acknowledge(receipt.receiptId, signal);
        if (keepRunning === false) return;
      }
      if (signal.aborted) break;
      if (failures) report({ state: "online" });
      failures = 0;
      // Guard against an endpoint returning empty responses immediately.
      if (!receipt) await wait(250, signal);
    } catch (error) {
      if (signal.aborted) break;
      if (
        error instanceof ApiError &&
        [400, 401, 403, 466, 469].includes(error.status)
      ) {
        report({ state: "stopped", message: error.message });
        return;
      }
      failures++;
      report({
        state: "reconnecting",
        message: "Связь прервалась. Восстанавливаем подключение…",
      });
      await wait(
        Math.min(1000 * 2 ** Math.min(failures - 1, 5), 30_000),
        signal,
      );
    }
  }
}
