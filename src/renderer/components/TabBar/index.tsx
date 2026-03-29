import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useTabsStore } from "@/features/tabs/tabs.store";
import { ConfirmCloseModal } from "../shared/modals/ConfirmCloseModal";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { TabItem } from "./components/TabItem";
import "./tab-bar.css";
import { Tab } from "renderer/types";

export function TabBar() {
  const {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    setSaveModalOpen,
    reorderTabs,
  } = useTabsStore();
  const [tabToConfirm, setTabToConfirm] = useState<Tab | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTabs(active.id as string, over.id as string);
    }
  };

  return (
    <div className="tab-bar">
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={tabs.map((t) => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          {tabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onClose={() => {
                if (tab.isDirty) setTabToConfirm(tab);
                else closeTab(tab.id);
              }}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        className="tab-bar-add"
        variant="icon"
        size="xs"
        onClick={() => openTab()}
      >
        <Plus size={16} />
      </Button>

      {tabToConfirm && (
        <ConfirmCloseModal
          isOpen={!!tabToConfirm}
          onClose={() => setTabToConfirm(null)}
          onDiscard={() => {
            closeTab(tabToConfirm.id);
            setTabToConfirm(null);
          }}
          onSave={() => {
            setTabToConfirm(null);
            setSaveModalOpen(true);
          }}
          tabName={tabToConfirm.name}
        />
      )}
    </div>
  );
}
