import React from "react";
import type { CollectionItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import "./collection-tree.css";

interface CollectionTreeProps {
  items: CollectionItem[];
  selectedId?: string | null;
  onSelect: (item: CollectionItem) => void;
}

export function CollectionTree({
  items,
  selectedId,
  onSelect,
}: CollectionTreeProps) {
  const collections = items.filter((item) => !item.request);

  return (
    <div className="collection-tree-root">
      {collections.map((item) => (
        <CollectionNode
          key={item.id}
          item={item}
          onSelect={onSelect}
          isSelected={selectedId === item.id}
        />
      ))}
    </div>
  );
}

function CollectionNode({ item, isSelected, onSelect }: any) {
  return (
    <Button
      variant="ghost"
      onClick={() => onSelect(item)}
      className={cn("collection-node", isSelected && "is-selected")}
    >
      <Folder
        size={14}
        className={cn("collection-node__icon", isSelected && "is-active")}
      />
      <span className="collection-node__name">{item.name}</span>
    </Button>
  );
}
