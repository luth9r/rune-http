import type React from "react";
import { useState } from "react";
import {
  Globe,
  ShieldCheck,
  Trash2,
  GripVertical,
  Edit2,
  MoreVertical,
} from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { SidebarItemBase } from "renderer/components/Sidebar/components/SidebarLayout";
import { useEnvStore } from "@/features/environments/environments.store";
import { GLOBAL_ENV_ID, GLOBAL_ENV_NAME } from "@/features/environments/environments.constants";
import { Button } from "@/components/ui/button";
import type { Environment, DropPosition } from "@/types";
import {
  ContextMenu,
  type ContextMenuItem,
} from "renderer/components/shared/ContextMenu";

interface EnvSidebarItemProps {
  env: Environment;
  isActive: boolean;
  isDragging?: boolean;
  dropIndicator?: DropPosition | null;
  onSelect: (id: string) => void;
  onDelete: (env: Environment) => void;
  onRename: (id: string, name: string) => void;
}

export function EnvSidebarItem({
  env,
  isActive,
  isDragging,
  dropIndicator,
  onSelect,
  onDelete,
  onRename,
}: EnvSidebarItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(env.name);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const isGlobal = env.id === GLOBAL_ENV_ID || env.name === GLOBAL_ENV_NAME;

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
  } = useDraggable({
    id: env.id,
    data: { env },
    disabled: isGlobal,
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: env.id,
    data: { env },
    disabled: isGlobal,
  });

  const setRefs = (el: HTMLElement | null) => {
    if (isGlobal) return;
    setDragRef(el);
    setDropRef(el);
  };

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== env.name) {
      onRename(env.id, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const menuItems: ContextMenuItem[] = [
    {
      label: "Rename",
      icon: <Edit2 size={14} />,
      onClick: () => setIsRenaming(true),
      disabled: isGlobal,
    },
    {
      label: "Delete",
      icon: <Trash2 size={14} />,
      onClick: () => onDelete(env),
      variant: "danger",
      disabled: isGlobal,
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      {dropIndicator === "before" && <DropLine />}
      <SidebarItemBase
        isActive={isActive}
        isDragging={isDragging}
        onClick={() => !isRenaming && onSelect(env.id)}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={setRefs}
      >
        <div style={s.itemLeft}>
          {!isGlobal && (
            <div {...listeners} {...attributes} style={s.grip}>
              <GripVertical color="var(--eos-muted)" size={12} />
            </div>
          )}
          <div style={{ marginLeft: isGlobal ? 4 : 0, display: "flex" }}>
            {isGlobal ? (
              <Globe color="var(--eos-accent)" size={13} />
            ) : (
              <ShieldCheck color="var(--eos-muted)" size={13} />
            )}
          </div>
          {isRenaming ? (
            <input
              autoFocus
              onBlur={handleRename}
              onChange={(e) => setRenameValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setRenameValue(env.name);
                  setIsRenaming(false);
                }
              }}
              style={s.renameInput}
              value={renameValue}
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                if (isGlobal) return;
                e.stopPropagation();
                setIsRenaming(true);
              }}
              style={{
                ...s.itemName,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--eos-text)" : "var(--eos-muted)",
              }}
            >
              {env.name}
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            opacity: isHovered ? 1 : 0,
          }}
        >
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleContextMenu(e);
            }}
            size="sm"
            style={{
              width: 20,
              height: 20,
              padding: 0,
              transition: "opacity 0.1s",
            }}
            variant="ghost"
          >
            <MoreVertical size={12} />
          </Button>
        </div>

        {contextMenu && (
          <ContextMenu
            items={menuItems}
            onClose={() => setContextMenu(null)}
            x={contextMenu.x}
            y={contextMenu.y}
          />
        )}
      </SidebarItemBase>
      {dropIndicator === "after" && <DropLine />}
    </div>
  );
}

function DropLine() {
  return (
    <div
      style={{
        height: 2,
        background: "var(--eos-accent)",
        margin: "2px 8px",
        borderRadius: 1,
      }}
    />
  );
}

const s: Record<string, React.CSSProperties> = {
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "7px 10px",
    borderRadius: "var(--radius)",
    cursor: "pointer",
    marginBottom: 2,
    transition: "background 0.1s, box-shadow 0.1s",
    minHeight: 34,
  },
  itemLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  grip: {
    display: "flex",
    alignItems: "center",
    cursor: "grab",
    padding: "4px 0",
    marginLeft: -4,
  },
  itemName: {
    fontSize: 13,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  renameInput: {
    flex: 1,
    fontSize: 13,
    background: "var(--eos-bg)",
    border: "1px solid var(--eos-accent)",
    borderRadius: 4,
    padding: "1px 6px",
    color: "var(--eos-text)",
    outline: "none",
    minWidth: 0,
  },
  deleteBtn: {
    width: 24,
    height: 24,
    padding: 0,
    flexShrink: 0,
    transition: "opacity 0.1s",
  },
};
