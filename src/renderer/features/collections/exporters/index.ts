import type { Collection, CollectionItem } from "@/types";

export function exportCollection(collection: Collection): string {
  // Native Rune Export - Cleanup internal fields and IDs
  const cleanCollection = { 
    ...collection,
    items: collection.items.map(item => {
      const { id: _, request, ...itemRest } = item;
      const newItem: any = { ...itemRest };
      if (request) {
        const { id: __, ...requestRest } = request;
        newItem.request = requestRest;
      }
      return newItem;
    })
  };
  
  delete (cleanCollection as any).id;
  delete (cleanCollection as any).isOpen;
  
  return JSON.stringify(cleanCollection, null, 2);
}

export function exportRequest(item: CollectionItem): string {
  if (!item.request) return '{}';
  const { id: _, ...requestRest } = item.request;
  return JSON.stringify(requestRest, null, 2);
}
