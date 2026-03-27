// src/hooks/useShortcuts.ts
import { useEffect } from "react";
import { useTabsStore } from "@/features/tabs/tabs.store";
import { useHttpRequest } from "./useHttpRequest";
import { useCollectionsStore } from "@/features/collections/collections.store";

export function useShortcuts() {
  const { tabs, activeTabId, setActiveTab, openTab, closeTab } = useTabsStore();

  const { sendRequest } = useHttpRequest();
  const updateRequest = useCollectionsStore((s) => s.updateRequest);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl + N (New Tab)
      if (modifier && e.code === "KeyN") {
        e.preventDefault();
        openTab();
      }

      // Ctrl + W (Close Tab)
      if (modifier && e.code === "KeyW") {
        if (activeTabId) {
          e.preventDefault();
          closeTab(activeTabId);
        }
      }

      // Ctrl + Enter (Send Request)
      if (modifier && e.code === "Enter") {
        if (activeTabId) {
          e.preventDefault();
          sendRequest(activeTabId);
        }
      }

      // Ctrl + S (Save)
      if (modifier && e.code === "KeyS") {
        e.preventDefault();
        const state = useTabsStore.getState();
        if (state.activeTabId) {
          state.saveTab(state.activeTabId, updateRequest);
        }
      }

      // Alt + Digit (Switch Tabs 1-9)
      if (e.altKey && !modifier) {
        // Коди цифр виглядають як "Digit1", "Digit2" і т.д.
        if (e.code.startsWith("Digit")) {
          const digit = parseInt(e.code.replace("Digit", ""));
          if (digit >= 1 && digit <= 9) {
            const targetTab = tabs[digit - 1];
            if (targetTab) {
              e.preventDefault();
              setActiveTab(targetTab.id);
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    tabs,
    activeTabId,
    openTab,
    closeTab,
    setActiveTab,
    sendRequest,
    updateRequest,
  ]);
}
