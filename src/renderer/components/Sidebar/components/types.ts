import type { DropPosition } from "@/types";

export type DropIndicator =
  | { type: DropPosition | 'collection'; id: string }
  | null;
