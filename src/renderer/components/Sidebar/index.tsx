import React, { useState, useMemo, useRef, useCallback } from "react";
import { Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { useCollectionsStore } from "@/features/collections/collections.store";
import { useTabsStore } from "@/features/tabs/tabs.store";
import { getMethodColor } from "@/utils/methodColor";
import type { CollectionItem } from "@/types";
import { Logo } from "renderer/components/shared/Logo";
import { ConfirmDeleteModal } from "@/components/shared/modals/ConfirmDeleteModal";
import { Button } from "../ui/button";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type Active,
  MeasuringStrategy,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import { DropIndicator } from "./components/types";
import { SidebarItem } from "./components/SidebarItem";
import { DraggableRow } from "./components/DraggableRow";
import { EmptyCollectionZone } from "./components/EmptyCollectionZone";

import {
  SidebarRoot,
  SidebarHeader,
  SidebarList,
  SidebarInput,
} from "renderer/components/Sidebar/components/SidebarLayout";
import { useResizable } from "@/hooks/useResizable";
import "./sidebar.css";

export function Sidebar() {
  const {
    collections,
    moveItem,
    addCollection,
    toggleCollection,
    removeCollection,
    removeItem,
  } = useCollectionsStore();

  const {
    size: width,
    startResizing,
  } = useResizable({
    persistenceKey: "rune-sidebar-width",
    initialSize: 256,
    minSize: 200,
    maxSize: 400,
  });

  const [activeItem, setActiveItem] = useState<Active | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator>(null);
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: "collection" | "request";
    collectionId?: string;
  } | null>(null);
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

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "collection") {
      // Assuming a removeCollection exists or needs to be added
      useCollectionsStore.getState().removeCollection?.(itemToDelete.id);
    } else if (itemToDelete.collectionId) {
      removeItem(itemToDelete.collectionId, itemToDelete.id);
    }

    setItemToDelete(null);
  };

  const activeEmptyColId = useMemo(() => {
    if (!dropIndicator || dropIndicator.type !== "collection") return null;
    const col = collections.find((c) => c.id === dropIndicator.id);
    if (col && col.items.length === 0) return col.id;
    return null;
  }, [dropIndicator, collections]);

  return (
    <SidebarRoot
      onResizeMouseDown={startResizing}
      style={{ width }}
    >
      <SidebarHeader title="">
        <Logo size="sm" />
        <Button onClick={() => setIsAddingCol(true)} variant="icon" size="xs">
          <Plus size={16} />
        </Button>
      </SidebarHeader>

      {isAddingCol && (
        <SidebarInput
          onCancel={() => setIsAddingCol(false)}
          onChange={setNewColName}
          onCommit={() => {
            if (newColName.trim()) {
              addCollection(newColName.trim());
              setNewColName("");
              setIsAddingCol(false);
            }
          }}
          placeholder="Collection name..."
          value={newColName}
        />
      )}

      <SidebarList>
        <DndContext
          collisionDetection={collisionDetection}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          {collections.map((col) => (
            <React.Fragment key={col.id}>
              <DraggableRow
                dropIndicator={dropIndicator}
                id={col.id}
                item={col}
                onRemove={() =>
                  setItemToDelete({
                    id: col.id,
                    name: col.name,
                    type: "collection",
                  })
                }
                type="collection"
              />
              {col.isOpen !== false && (
                <>
                  {col.items.map((item) => (
                    <DraggableRow
                      collectionId={col.id}
                      dropIndicator={dropIndicator}
                      id={item.id}
                      item={item}
                      key={item.id}
                      onRemove={() =>
                        setItemToDelete({
                          id: item.id,
                          name: item.name,
                          type: "request",
                          collectionId: col.id,
                        })
                      }
                      type="request"
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
              <SidebarItem item={activeItem.data.current?.item} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </SidebarList>
      {itemToDelete && (
        <ConfirmDeleteModal
          isOpen={!!itemToDelete}
          itemName={itemToDelete.name}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
          title={`Delete ${itemToDelete.type === "collection" ? "Collection" : "Request"}`}
        />
      )}
    </SidebarRoot>
  );
}
