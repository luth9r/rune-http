import React, { useState, useMemo, useRef, useCallback } from "react";
import { Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { useCollectionsStore } from "@/features/collections/collections.store";
import { useTabsStore } from "@/features/tabs/tabs.store";
import { getMethodColor } from "@/utils/methodColor";
import type { CollectionItem } from "@/types";
import { Logo } from "../shared/Logo";
import { Button } from "../ui/button";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  Active,
  MeasuringStrategy,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

// ─── Types and Internal Components ──────────────────────────────────────────

type DropIndicator =
  | { type: "before"; id: string }
  | { type: "after"; id: string }
  | { type: "collection"; id: string }
  | null;

// ─── Pure UI item ─────────────────────────────────────────────────────────────

interface SidebarItemProps {
  item:
    | CollectionItem
    | { id: string; name: string; type: "collection"; isOpen?: boolean };
  hovered?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  onRemove?: () => void;
  onAddRequest?: () => void;
  onToggle?: () => void;
  style?: React.CSSProperties;
}

function SidebarItem({
  item,
  hovered,
  isDragging,
  isDropTarget,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onRemove,
  onAddRequest,
  onToggle,
  style: externalStyle,
}: SidebarItemProps) {
  const isCollection = item.type === "collection";

  const baseStyle: React.CSSProperties = {
    ...styles.itemBase,
    ...externalStyle,
    opacity: 1,
    background: isDropTarget
      ? "color-mix(in srgb, var(--eos-accent) 12%, transparent)"
      : hovered
        ? "var(--eos-surface-2)"
        : "transparent",
    outline: isDropTarget ? "1px solid var(--eos-accent)" : "none",
    outlineOffset: -1,
    cursor: "pointer",
    transition: "background 0.1s, outline 0.1s",
  };

  if (isCollection) {
    return (
      <div
        style={{
          ...baseStyle,
          fontWeight: 700,
          fontSize: 11,
          color: isDropTarget ? "var(--eos-accent)" : "var(--eos-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onToggle}
      >
        <span style={{ display: "flex", alignItems: "center", marginRight: 4 }}>
          {item.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.name}
        </span>
        <div style={{ display: "flex", gap: 2, opacity: hovered ? 1 : 0 }}>
          <Button
            variant="icon"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddRequest?.();
            }}
          >
            <Plus size={12} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={baseStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <span
        style={{
          ...styles.method,
          color: getMethodColor(
            (item as CollectionItem).request?.method || "GET",
          ),
        }}
      >
        {(item as CollectionItem).request?.method}
      </span>
      <span style={styles.itemName}>{item.name}</span>
      <div style={{ ...styles.actions, opacity: hovered ? 1 : 0 }}>
        {onRemove && (
          <Button
            variant="ghost-danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{ width: 22, height: 22, padding: 0 }}
          >
            <Trash2 size={12} />
          </Button>
        )}
      </div>
    </div>
  );
}

function DropLine({ indent = 24 }: { indent?: number }) {
  return (
    <div
      style={{
        position: "relative",
        height: 0,
        marginLeft: indent,
        marginRight: 8,
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -1,
          left: 0,
          right: 0,
          height: 2,
          borderRadius: 1,
          background: "var(--eos-accent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -3,
          left: -4,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--eos-accent)",
        }}
      />
    </div>
  );
}

// ─── Draggable row ────────────────────────────────────────────────────────────

function DraggableRow({
  id,
  type,
  item,
  collectionId,
  dropIndicator,
}: {
  id: string;
  type: "collection" | "request";
  item: any;
  collectionId?: string;
  dropIndicator: DropIndicator;
}) {
  const { removeItem, addRequest, toggleCollection } = useCollectionsStore();
  const { openTab } = useTabsStore();
  const [hovered, setHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id,
    data: { type, item, collectionId },
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id,
    data: { type, item, collectionId },
  });

  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      setDragRef(node);
      setDropRef(node);
    },
    [setDragRef, setDropRef],
  );

  const isCollection = type === "collection";
  const isDropTarget =
    dropIndicator?.type === "collection" && dropIndicator.id === id;
  const showBefore =
    dropIndicator?.type === "before" && dropIndicator.id === id;
  const showAfter = dropIndicator?.type === "after" && dropIndicator.id === id;

  return (
    <>
      {showBefore && <DropLine indent={isCollection ? 12 : 24} />}
      <div ref={setNodeRef} {...attributes} {...listeners}>
        <SidebarItem
          item={isCollection ? { ...item, type: "collection" } : item}
          hovered={hovered}
          isDragging={isDragging}
          isDropTarget={isDropTarget}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() =>
            !isCollection &&
            item.request &&
            openTab({ requestId: item.id, collectionId, ...item.request })
          }
          onRemove={
            !isCollection ? () => removeItem(collectionId!, item.id) : undefined
          }
          onAddRequest={
            isCollection
              ? () =>
                  addRequest(item.id, {
                    name: "New Request",
                    method: "GET",
                    url: "",
                    headers: [],
                    params: [],
                    body: "",
                    bodyType: "none",
                    auth: { type: "none" },
                  })
              : undefined
          }
          onToggle={isCollection ? () => toggleCollection(item.id) : undefined}
          style={{
            paddingLeft: isCollection ? 12 : 24,
            marginTop: isCollection ? 12 : 0,
          }}
        />
      </div>
      {showAfter && <DropLine indent={isCollection ? 12 : 24} />}
    </>
  );
}

function EmptyCollectionZone({
  collectionId,
  isActive,
}: {
  collectionId: string;
  isActive: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: `empty-${collectionId}`,
    data: { type: "emptyCollection", collectionId },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        height: isActive ? 28 : 8,
        marginLeft: 24,
        marginRight: 8,
        marginBottom: 2,
        borderRadius: "var(--radius)",
        border: isActive
          ? "1px dashed var(--eos-accent)"
          : "1px dashed transparent",
        background: isActive
          ? "color-mix(in srgb, var(--eos-accent) 8%, transparent)"
          : "transparent",
        transition: "all 0.15s ease",
      }}
    />
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { collections, moveItem, addCollection, toggleCollection } =
    useCollectionsStore();
  const [activeItem, setActiveItem] = useState<Active | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator>(null);
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const openSnapshot = useRef<Record<string, boolean>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const idToType = useMemo(() => {
    const map: Record<string, "collection" | "request"> = {};
    collections.forEach((col) => {
      map[col.id] = "collection";
      col.items.forEach((item) => {
        map[item.id] = "request";
      });
    });
    return map;
  }, [collections]);

  const collisionDetection = useCallback((args: any) => {
    const hits = pointerWithin(args);
    return hits.length > 0 ? hits : rectIntersection(args);
  }, []);

  const handleDragStart = useCallback(
    (e: DragStartEvent) => {
      setActiveItem(e.active);
      setDropIndicator(null);

      if (idToType[e.active.id as string] === "collection") {
        const snapshot: Record<string, boolean> = {};
        collections.forEach((c) => {
          snapshot[c.id] = c.isOpen ?? true;
        });
        openSnapshot.current = snapshot;
        collections.forEach((c) => {
          if (c.isOpen !== false) toggleCollection(c.id);
        });
      }
    },
    [collections, idToType, toggleCollection],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        setDropIndicator(null);
        return;
      }

      const draggedId = active.id as string;
      const overId = over.id as string;
      const draggedType = idToType[draggedId];
      const overType = idToType[overId];

      if (overId.startsWith("empty-")) {
        const colId = overId.replace("empty-", "");
        setDropIndicator({ type: "collection", id: colId });
        return;
      }

      if (draggedType === "collection" && overType === "collection") {
        const activeRect = active.rect.current.translated;
        const overRect = over.rect;
        if (!activeRect || !overRect) return;
        const activeCenter = activeRect.top + activeRect.height / 2;
        const overCenter = overRect.top + overRect.height / 2;
        setDropIndicator({
          type: activeCenter < overCenter ? "before" : "after",
          id: overId,
        });
        return;
      }

      if (draggedType === "request") {
        if (overType === "collection") {
          setDropIndicator({ type: "collection", id: overId });
          return;
        }
        if (overType === "request") {
          const activeRect = active.rect.current.translated;
          const overRect = over.rect;
          if (!activeRect || !overRect) return;
          const activeCenter = activeRect.top + activeRect.height / 2;
          const overCenter = overRect.top + overRect.height / 2;
          setDropIndicator({
            type: activeCenter < overCenter ? "before" : "after",
            id: overId,
          });
        }
      }
    },
    [idToType],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveItem(null);
      setDropIndicator(null);

      const draggedType = idToType[active.id as string];

      if (over && active.id !== over.id) {
        const overId = over.id as string;

        if (overId.startsWith("empty-")) {
          const targetColId = overId.replace("empty-", "");
          moveItem(active.id as string, targetColId, "inside");
        } else {
          const overType = idToType[overId];

          if (draggedType === "collection" && overType === "collection") {
            const activeIdx = collections.findIndex((c) => c.id === active.id);
            const overIdx = collections.findIndex((c) => c.id === overId);
            moveItem(
              active.id as string,
              overId,
              overIdx < activeIdx ? "before" : "after",
            );
          } else if (draggedType === "request" && overType === "collection") {
            moveItem(active.id as string, overId, "inside");
          } else if (draggedType === "request" && overType === "request") {
            const activeRect = active.rect.current.translated;
            const overRect = over.rect;
            if (activeRect && overRect) {
              const ac = activeRect.top + activeRect.height / 2;
              const oc = overRect.top + overRect.height / 2;
              moveItem(
                active.id as string,
                overId,
                ac < oc ? "before" : "after",
              );
            }
          }
        }
      }

      if (draggedType === "collection") {
        const snapshot = openSnapshot.current;
        setTimeout(() => {
          useCollectionsStore.getState().collections.forEach((c) => {
            if (snapshot[c.id] && c.isOpen === false) toggleCollection(c.id);
          });
          openSnapshot.current = {};
        }, 0);
      }
    },
    [collections, idToType, moveItem, toggleCollection],
  );

  const activeEmptyColId = useMemo(() => {
    if (!dropIndicator || dropIndicator.type !== "collection") return null;
    const col = collections.find((c) => c.id === dropIndicator.id);
    if (col && col.items.length === 0) return col.id;
    return null;
  }, [dropIndicator, collections]);

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <Logo size="sm" />
        <Button variant="icon" onClick={() => setIsAddingCol(true)}>
          <Plus size={16} />
        </Button>
      </div>

      {isAddingCol && (
        <div style={styles.newColInput}>
          <input
            autoFocus
            style={styles.inlineInput}
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newColName.trim()) {
                addCollection(newColName.trim());
                setNewColName("");
                setIsAddingCol(false);
              }
              if (e.key === "Escape") setIsAddingCol(false);
            }}
            placeholder="Collection name..."
          />
        </div>
      )}

      <div style={styles.list}>
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        >
          {collections.map((col) => (
            <React.Fragment key={col.id}>
              <DraggableRow
                id={col.id}
                type="collection"
                item={col}
                dropIndicator={dropIndicator}
              />
              {col.isOpen !== false && (
                <>
                  {col.items.map((item) => (
                    <DraggableRow
                      key={item.id}
                      id={item.id}
                      type="request"
                      item={item}
                      collectionId={col.id}
                      dropIndicator={dropIndicator}
                    />
                  ))}
                  {col.items.length === 0 && (
                    <EmptyCollectionZone
                      collectionId={col.id}
                      isActive={activeEmptyColId === col.id}
                    />
                  )}
                </>
              )}
            </React.Fragment>
          ))}

          <DragOverlay dropAnimation={null}>
            {activeItem ? (
              <SidebarItem
                item={activeItem.data.current?.item}
                style={{
                  background: "var(--eos-surface-2)",
                  boxShadow:
                    "0 4px 16px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--eos-border)",
                  pointerEvents: "none",
                  width: 240,
                  paddingLeft:
                    idToType[activeItem.id as string] === "collection"
                      ? 12
                      : 24,
                  opacity: 1,
                  cursor: "grabbing",
                }}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 256,
    borderRight: "1px solid var(--eos-border)",
    background: "var(--eos-surface)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    flexShrink: 0,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid var(--eos-border)",
    flexShrink: 0,
  },
  list: { flex: 1, overflowY: "auto", padding: "12px 8px" },
  itemBase: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: "var(--radius)",
    minHeight: 32,
    margin: "1px 0",
  },
  itemName: {
    fontSize: 12,
    color: "var(--eos-text)",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  method: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    width: 34,
    flexShrink: 0,
  },
  newColInput: {
    padding: "8px 12px",
    borderBottom: "1px solid var(--eos-border)",
  },
  inlineInput: {
    width: "100%",
    background: "var(--eos-bg)",
    border: "1px solid var(--eos-accent)",
    borderRadius: "var(--radius)",
    padding: "4px 8px",
    fontSize: 12,
    color: "var(--eos-text)",
    outline: "none",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    transition: "opacity 0.1s",
    minWidth: 24,
    justifyContent: "flex-end",
  },
} satisfies Record<string, React.CSSProperties>;
