import type {
  HttpMethod,
  HttpResponse,
  BodyType,
  AuthConfig,
  KeyValuePair,
} from "./http.types";

export interface Tab {
  id: string;
  requestId?: string; // binding for a collection
  collectionId?: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: string;
  bodyType: BodyType;
  auth: AuthConfig;
  response: HttpResponse | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean; // has unsaved changes
  savedState: string | null; // serialized state for undo/redo
}
