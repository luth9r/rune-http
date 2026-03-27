import type { HttpRequest, HttpResponse, Collection } from "./index";

interface IpcResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

declare global {
  interface Window {
    api: {
      http: {
        sendRequest: (
          request: HttpRequest,
          envVars: Record<string, string>,
        ) => Promise<IpcResponse<HttpResponse>>;
      };
      collections: {
        getAll: () => Promise<Collection[]>;
        saveAll: (collections: Collection[]) => Promise<boolean>;
      };
      webFrame: {
        setZoomFactor: (factor: number) => void;
        getZoomFactor: () => number;
      };
      storage: {
        read: <T>(name: string, fallback: T) => Promise<T>;
        write: (name: string, data: unknown) => Promise<void>;
      };
    };
  }
}
