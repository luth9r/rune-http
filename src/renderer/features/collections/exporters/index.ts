import { exportToPostman } from "./postman";
import { exportToInsomnia } from "./insomnia";
import type { Collection, CollectionItem } from "@/types";

export type ExportFormat = 'json' | 'postman' | 'insomnia'

export function exportCollection(collection: Collection, format: ExportFormat = 'json'): string {
  if (format === 'postman') {
    return JSON.stringify(exportToPostman(collection), null, 2);
  }
  
  if (format === 'insomnia') {
    return JSON.stringify(exportToInsomnia(collection), null, 2);
  }

  // Native Rune Export - Cleanup internal fields
  const cleanCollection = { ...collection };
  delete cleanCollection.isOpen;
  
  return JSON.stringify(cleanCollection, null, 2);
}

export function exportRequest(item: CollectionItem, format: ExportFormat = 'json'): string {
  if (format === 'json') {
    return JSON.stringify(item.request, null, 2);
  }

  // For Postman/Insomnia, we wrap the request in a minimal collection
  const mockCollection: Collection = {
    id: 'temp-export',
    name: item.name,
    items: [item],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  if (format === 'postman') {
    return JSON.stringify(exportToPostman(mockCollection), null, 2);
  }

  return JSON.stringify(exportToInsomnia(mockCollection), null, 2);
}
