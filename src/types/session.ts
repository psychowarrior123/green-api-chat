import type { GreenApi } from "../api/green-api";

export interface Session {
  api: GreenApi;
  warnings: string[];
}
