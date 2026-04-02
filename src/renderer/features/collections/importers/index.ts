import { importPostman } from "./postman";
import { importInsomnia } from "./insomnia";
import { importOpenApi } from "./openApi";
import type { Collection } from "@/types";

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

    if (data.openapi && data.openapi.startsWith("3.")) {
      return importOpenApi(data);
    }

    // Native Rune Detection (fallback or explicit check)
    if (data.id && Array.isArray(data.items)) {
      return data as Collection;
    }

    return null;
  } catch (e) {
    console.error("Failed to parse collection content", e);
    return null;
  }
}
