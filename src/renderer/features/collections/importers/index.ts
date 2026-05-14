import type { Collection, HttpRequest } from "@/types";
import { v4 as uuid } from 'uuid';

export type ImportType = 'collection' | 'request';

export interface ImportResult {
  type: ImportType;
  data: Collection | HttpRequest;
}

export function detectAndImport(content: string): ImportResult | null {
  try {
    const data = JSON.parse(content);

    // Native Rune Collection Detection
    if (Array.isArray(data.items)) {
      const rawCollection = data as Collection;
      const collection: Collection = {
        ...rawCollection,
        id: uuid(), // Always new ID for collection
        items: rawCollection.items.map(item => {
          const itemId = uuid();
          const newItem = {
            ...item,
            id: itemId,
          };
          if (newItem.type === 'request' && newItem.request) {
            newItem.request = {
              ...newItem.request,
              id: itemId, // Match item ID
            };
            normalizeRequest(newItem.request);
          }
          return newItem;
        }),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return { type: 'collection', data: collection };
    }

    // Single Request Detection (Rune/Generic)
    if (data.method && data.url) {
      const id = uuid();
      const request: HttpRequest = {
        headers: [],
        params: [],
        cookies: [],
        body: '',
        auth: { type: 'none' },
        ...data,
        id,
      };
      normalizeRequest(request);
      return { type: 'request', data: request };
    }

    return null;
  } catch (e) {
    return null;
  }
}

function normalizeRequest(req: HttpRequest) {
  req.headers = req.headers || [];
  req.params = req.params || [];
  req.cookies = req.cookies || [];
  req.body = req.body || '';
  req.auth = req.auth || { type: 'none' };
}
