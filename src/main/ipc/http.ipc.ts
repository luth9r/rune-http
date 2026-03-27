import { ipcMain } from "electron";
import { executeRequest } from "../services/httpClient";
import type { HttpRequest } from "@/types";

export const HTTP_CHANNELS = {
  SEND_REQUEST: "http:send-request",
  CANCEL_REQUEST: "http:cancel-request",
} as const;

export function registerHttpIpc(): void {
  ipcMain.handle(
    HTTP_CHANNELS.SEND_REQUEST,
    async (_event, request: HttpRequest, envVars: Record<string, string>) => {
      try {
        const response = await executeRequest(request, envVars);
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );
}
