import { importPostman } from "./postman";
import { importInsomnia } from "./insomnia";
import type { Collection } from "@/types";
import { v4 as uuid } from 'uuid';

export function detectAndImport(content: string): Collection | null {
  try {
    const data = JSON.parse(content);

    // Postman Detection (v2.1)
    if (data.info && data.info.schema && data.info.schema.includes("postman")) {
      return importPostman(data);
    }

    // Insomnia Detection
    if (
      data._type === "export" ||
      (Array.isArray(data.resources) &&
        data.resources.some(
          (r: any) => r._type && r._type.startsWith("request"),
        ))
    ) {
      return importInsomnia(data);
    }

    // Native Rune Collection Detection
    if (data.id && Array.isArray(data.items)) {
      return data as Collection;
    }

    // Single Request Detection (Rune/Generic)
    if (data.method && data.url) {
      const id = uuid();
      return {
        id: uuid(),
        name: data.name || 'Imported Request',
        items: [{
          id,
          type: 'request',
          name: data.name || 'Imported Request',
          request: { ...data, id }
        }],
        createdAt: Date.now(),
        updatedAt: Date.now()
      } as Collection;
    }

    return null;
  } catch (e) {
    console.error("Failed to parse collection content", e);
    return null;
  }
}
