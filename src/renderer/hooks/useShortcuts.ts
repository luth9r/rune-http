// src/hooks/useShortcuts.ts
import { useEffect } from "react";
import { useTabsStore } from "@/features/tabs/tabs.store";
import { useHttpRequest } from "./useHttpRequest";
import { useCollectionsStore } from "renderer/features/collections/collections.store";

export function useShortcuts() {
  const { openTab, closeTab, activeTabId, setSaveModalOpen, markClean } =
    useTabsStore();
  const { sendRequest } = useHttpRequest();
  const updateRequest = useCollectionsStore((s) => s.updateRequest);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName) ||
        (e.target as HTMLElement).isContentEditable;

      // Ctrl + N
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        openTab();
      }

      // Ctrl + W
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        if (activeTabId) {
          e.preventDefault();
          closeTab(activeTabId);
        }
      }

      // Ctrl + P
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        console.log("Search collections...");
      }

      // Ctrl + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (activeTabId) {
          e.preventDefault();
          sendRequest(activeTabId);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const tabs = useTabsStore.getState().tabs;
        const activeTab = tabs.find((t) => t.id === activeTabId);

        if (activeTab && activeTab.isDirty) {
          if (!activeTab.requestId) {
            setSaveModalOpen(true);
          } else {
            updateRequest(activeTab.collectionId!, activeTab.requestId, {
              method: activeTab.method,
              url: activeTab.url,
              headers: activeTab.headers,
              params: activeTab.params,
              body: activeTab.body,
              bodyType: activeTab.bodyType,
              auth: activeTab.auth,
            });
            markClean(activeTab.id);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openTab, closeTab, activeTabId]);
}
