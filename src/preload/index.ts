import { contextBridge, ipcRenderer, webFrame } from "electron";
import type { HttpRequest, Collection } from "@/types";

contextBridge.exposeInMainWorld("api", {
  http: {
    sendRequest: (request: HttpRequest, envVars: Record<string, string>) =>
      ipcRenderer.invoke("http:send-request", request, envVars),
  },
  collections: {
    getAll: (): Promise<Collection[]> =>
      ipcRenderer.invoke("collections:get-all"),
    saveAll: (collections: Collection[]): Promise<boolean> =>
      ipcRenderer.invoke("collections:save-all", collections),
  },
  webFrame: {
    setZoomFactor(factor: number) {
      webFrame.setZoomFactor(factor);
    },
    getZoomFactor() {
      return webFrame.getZoomFactor();
    },
  },
  storage: {
    read: <T>(name: string, fallback: T): Promise<T> =>
      ipcRenderer.invoke("storage:read", name, fallback),
    write: (name: string, data: unknown): Promise<void> =>
      ipcRenderer.invoke("storage:write", name, data),
  },
});
