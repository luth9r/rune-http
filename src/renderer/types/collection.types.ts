import type { HttpRequest } from "./http.types";

export type CollectionItemType = "request" | "folder";

export interface CollectionItem {
  id: string;
  type: CollectionItemType;
  name: string;
  request?: HttpRequest;
  children?: CollectionItem[];
  isOpen?: boolean; // for folders — expanded or collapsed
}

export interface Collection {
  id: string;
  name: string;
  items: CollectionItem[];
  createdAt: number;
  updatedAt: number;
}
