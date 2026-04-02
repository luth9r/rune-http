import { exportToOpenApi } from "./openApi";
import type { Collection } from "@/types";

export function exportCollection(collection: Collection, format: "openapi" | "json"): string {
  if (format === "openapi") {
    const data = exportToOpenApi(collection);
    return JSON.stringify(data, null, 2);
  }
  
  return JSON.stringify(collection, null, 2);
}
