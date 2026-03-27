import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { v4 as uuid } from "uuid";
import type { Collection, CollectionItem } from "@/types";
import type { HttpRequest } from "@/types";
import { electronStorage } from "renderer/lib/electronStorage";

interface CollectionsState {
  collections: Collection[];
  addCollection: (name: string) => void;
  removeCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addRequest: (
    collectionId: string,
    request: Omit<HttpRequest, "id">,
    parentId?: string,
  ) => string;
  renameItem: (collectionId: string, itemId: string, newName: string) => void;
  addFolder: (collectionId: string, name: string, parentId?: string) => void;
  removeItem: (collectionId: string, itemId: string) => void;
  toggleFolder: (collectionId: string, itemId: string) => void;
  updateRequest: (
    collectionId: string,
    itemId: string,
    patch: Partial<HttpRequest>,
  ) => void;
}

function findItem(items: CollectionItem[], id: string): CollectionItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItem(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findAndRemove(items: CollectionItem[], id: string): boolean {
  const idx = items.findIndex((i) => i.id === id);
  if (idx !== -1) {
    items.splice(idx, 1);
    return true;
  }
  return items.some((i) => i.children && findAndRemove(i.children, id));
}

export const useCollectionsStore = create<CollectionsState>()(
  persist(
    immer((set) => ({
      collections: [],

      addCollection: (name) =>
        set((state) => {
          state.collections.push({
            id: uuid(),
            name,
            items: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }),

      removeCollection: (id) =>
        set((state) => {
          state.collections = state.collections.filter((c) => c.id !== id);
        }),

      renameCollection: (id, name) =>
        set((state) => {
          const col = state.collections.find((c) => c.id === id);
          if (col) {
            col.name = name;
            col.updatedAt = Date.now();
          }
        }),

      addRequest: (collectionId, request, parentId) => {
        const itemId = uuid();
        set((state) => {
          const col = state.collections.find((c) => c.id === collectionId);
          if (!col) return;

          const newRequestItem: CollectionItem = {
            id: itemId,
            type: "request",
            name: request.name || "New Request",
            request: { ...request, id: itemId },
          };

          if (parentId) {
            const parent = findItem(col.items, parentId);
            if (parent?.children) {
              parent.children.push(newRequestItem);
            }
          } else {
            col.items.push(newRequestItem);
          }
          col.updatedAt = Date.now();
        });

        return itemId;
      },

      renameItem: (collectionId, itemId, newName) =>
        set((state) => {
          const col = state.collections.find((c) => c.id === collectionId);
          if (!col) return;
          const item = findItem(col.items, itemId);
          if (item) item.name = newName;
        }),

      addFolder: (collectionId, name, parentId) =>
        set((state) => {
          const col = state.collections.find((c) => c.id === collectionId);
          if (!col) return;
          const folder: CollectionItem = {
            id: uuid(),
            type: "folder",
            name,
            children: [],
            isOpen: true,
          };
          if (parentId) {
            const parent = findItem(col.items, parentId);
            if (parent?.children) parent.children.push(folder);
          } else {
            col.items.push(folder);
          }
        }),

      removeItem: (collectionId, itemId) =>
        set((state) => {
          const col = state.collections.find((c) => c.id === collectionId);
          if (col) findAndRemove(col.items, itemId);
        }),

      toggleFolder: (collectionId, itemId) =>
        set((state) => {
          const col = state.collections.find((c) => c.id === collectionId);
          if (!col) return;
          const item = findItem(col.items, itemId);
          if (item?.type === "folder") item.isOpen = !item.isOpen;
        }),

      updateRequest: (collectionId, itemId, patch) =>
        set((state) => {
          const col = state.collections.find((c) => c.id === collectionId);
          if (!col) return;
          const item = findItem(col.items, itemId);
          if (item?.request) Object.assign(item.request, patch);
        }),
    })),
    {
      name: "rune-collections",
      storage: createJSONStorage(() => electronStorage),
      onRehydrateStorage: (state) => {
        console.log("Hydration starting...");
        return (state, error) => {
          if (error) {
            console.error("An error happened during hydration", error);
          } else {
            console.log("Hydration finished");
          }
        };
      },
    },
  ),
);
