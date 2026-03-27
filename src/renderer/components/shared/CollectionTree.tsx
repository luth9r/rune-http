import React, { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { CollectionItem } from "@/types";
import { getMethodColor } from "@/utils/methodColor";
import { Button } from "../ui/button";

interface CollectionTreeProps {
  items: CollectionItem[];
  level?: number;
  showRequests?: boolean;
  selectedId?: string;
  onSelect: (item: CollectionItem) => void;
}

export function CollectionTree({
  items,
  level = 0,
  showRequests = false,
  selectedId,
  onSelect,
}: CollectionTreeProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((item) => (
        <TreeNode
          key={item.id}
          item={item}
          level={level}
          showRequests={showRequests}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function TreeNode({ item, level, showRequests, selectedId, onSelect }: any) {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = item.type === "folder";
  const isSelected = selectedId === item.id;

  if (!showRequests && !isFolder) return null;

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => {
          if (isFolder) setIsOpen(!isOpen);
          onSelect(item);
        }}
        style={{
          justifyContent: "flex-start",
          padding: "6px 8px",
          paddingLeft: level * 12 + 8,
          width: "100%",
          borderRadius: "var(--radius)",
          backgroundColor: isSelected ? "var(--eos-surface-2)" : "transparent",
          color: isSelected ? "var(--eos-text)" : "var(--eos-muted)",
          gap: 6,
          height: "auto",
        }}
      >
        {isFolder ? (
          item.children?.length > 0 ? (
            isOpen ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )
          ) : (
            <div style={{ width: 12 }} />
          )
        ) : (
          <div style={{ width: 12 }} />
        )}

        {isFolder ? (
          isOpen ? (
            <FolderOpen
              size={13}
              style={{ color: "var(--eos-accent)", flexShrink: 0 }}
            />
          ) : (
            <Folder
              size={13}
              style={{ color: "var(--eos-muted)", flexShrink: 0 }}
            />
          )
        ) : (
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              width: 32,
              color: getMethodColor(item.request?.method),
              textAlign: "left",
            }}
          >
            {item.request?.method}
          </span>
        )}

        <span
          style={{
            fontSize: 12,
            fontWeight: isSelected ? 600 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.name}
        </span>
      </Button>

      {isFolder && isOpen && item.children && (
        <CollectionTree
          items={item.children}
          level={level + 1}
          showRequests={showRequests}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}
    </>
  );
}
