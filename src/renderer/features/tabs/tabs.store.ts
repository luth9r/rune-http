import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { v4 as uuid } from "uuid";
import type { Tab } from "@/types";
import { createJSONStorage, persist } from "zustand/middleware";
import { electronStorage } from "renderer/lib/electronStorage";

function createEmptyTab(overrides?: Partial<Tab>): Tab {
  return {
    id: uuid(),
    name: "New Request",
    method: "GET",
    url: "",
    headers: [],
    params: [],
    body: "",
    bodyType: "none",
    auth: { type: "none" },
    response: null,
    isLoading: false,
    error: null,
    isDirty: false,
    savedState: null,
    requestId: undefined,
    collectionId: undefined,
    ...overrides,
  };
}

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (overrides?: Partial<Tab>) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, patch: Partial<Tab>) => void;
  updateTabByRequestId: (requestId: string, patch: Partial<Tab>) => void;
  setTabLoading: (id: string, isLoading: boolean) => void;
  reorderTabs: (activeId: string, overId: string) => void;
  setTabResponse: (
    id: string,
    response: Tab["response"],
    error?: string | null,
  ) => void;
  markClean: (id: string) => void;
  saveTab: (id: string, updateRequestFn: any) => void;
  isSaveModalOpen: boolean;
  setSaveModalOpen: (open: boolean) => void;
}

const getCompareState = (tab: Tab) =>
  JSON.stringify({
    url: tab.url,
    method: tab.method,
    body: tab.body,
    headers: tab.headers,
    params: tab.params,
    auth: tab.auth,
    bodyType: tab.bodyType,
  });

const initialTab = createEmptyTab();

export const useTabsStore = create<TabsState>()(
  persist(
    immer((set, get) => ({
      tabs: [initialTab],
      activeTabId: initialTab.id,

      openTab: (overrides) =>
        set((state) => {
          if (overrides?.requestId) {
            const existingTab = state.tabs.find(
              (t) => t.requestId === overrides.requestId,
            );
            if (existingTab) {
              state.activeTabId = existingTab.id;
              return;
            }
          }

          const tab = createEmptyTab(overrides);
          tab.savedState = getCompareState(tab);
          tab.isDirty = false;

          state.tabs.push(tab);
          state.activeTabId = tab.id;
        }),

      closeTab: (id) =>
        set((state) => {
          const idx = state.tabs.findIndex((t) => t.id === id);
          if (idx === -1) return;

          state.tabs.splice(idx, 1);
          if (state.activeTabId === id) {
            state.activeTabId =
              state.tabs[idx - 1]?.id ?? state.tabs[idx]?.id ?? null;
          }
        }),

      setActiveTab: (id) =>
        set((state) => {
          state.activeTabId = id;
        }),

      updateTabByRequestId: (requestId, patch) =>
        set((state) => {
          const tab = state.tabs.find((t) => t.requestId === requestId);
          if (tab) {
            Object.assign(tab, patch);
            tab.savedState = getCompareState(tab);
            tab.isDirty = false;
          }
        }),

      updateTab: (id, patch) =>
        set((state) => {
          const tab = state.tabs.find((t) => t.id === id);
          if (!tab) return;

          Object.assign(tab, patch);

          if (!tab.requestId) {
            tab.isDirty = true;
          } else if (tab.savedState) {
            const currentState = getCompareState(tab);
            tab.isDirty = currentState !== tab.savedState;
          }
        }),

      setTabLoading: (id, isLoading) =>
        set((state) => {
          const tab = state.tabs.find((t) => t.id === id);
          if (tab) {
            tab.isLoading = isLoading;
            tab.error = null;
          }
        }),

      reorderTabs: (activeId, overId) =>
        set((state) => {
          const oldIndex = state.tabs.findIndex((t) => t.id === activeId);
          const newIndex = state.tabs.findIndex((t) => t.id === overId);

          if (oldIndex !== -1 && newIndex !== -1) {
            const [movedTab] = state.tabs.splice(oldIndex, 1);
            state.tabs.splice(newIndex, 0, movedTab);
          }
        }),

      setTabResponse: (id, response, error = null) =>
        set((state) => {
          const tab = state.tabs.find((t) => t.id === id);
          if (tab) {
            tab.response = response;
            tab.isLoading = false;
            tab.error = error;
          }
        }),

      markClean: (id) =>
        set((state) => {
          const tab = state.tabs.find((t) => t.id === id);
          if (tab) {
            tab.isDirty = false;
            tab.savedState = getCompareState(tab);
          }
        }),

      saveTab: (id, updateRequestFn) => {
        const state = get();
        const tab = state.tabs.find((t) => t.id === id);
        if (!tab || !tab.isDirty) return;

        let finalBody = tab.body;
        if (tab.bodyType === "json" && tab.body) {
          try {
            finalBody = JSON.stringify(JSON.parse(tab.body), null, 2);
            set((s) => {
              const t = s.tabs.find((x) => x.id === id);
              if (t) t.body = finalBody;
            });
          } catch (e) {}
        }

        if (!tab) {
          console.error("Tab not found:", id);
          return;
        }

        if (!tab.isDirty) {
          console.warn("Tab is clean, nothing to save");
          return;
        }

        if (!tab.requestId || !tab.collectionId) {
          set((s) => {
            s.isSaveModalOpen = true;
          });
          return;
        }

        console.log("Updating EXISTING tab in collection");
        updateRequestFn(tab.collectionId, tab.requestId, {
          method: tab.method,
          url: tab.url,
          headers: tab.headers,
          params: tab.params,
          body: finalBody,
          bodyType: tab.bodyType,
          auth: tab.auth,
          name: tab.name,
        });

        set((s) => {
          const t = s.tabs.find((item) => item.id === id);
          if (t) {
            t.body = finalBody;
            t.isDirty = false;
            t.savedState = getCompareState(t);
          }
        });
      },

      isSaveModalOpen: false,
      setSaveModalOpen: (open) =>
        set((state) => {
          state.isSaveModalOpen = open;
        }),
    })),
    {
      name: "rune-tabs-history",
      storage: createJSONStorage(() => electronStorage),
    },
  ),
);

export const selectActiveTab = (state: TabsState) =>
  state.tabs.find((t) => t.id === state.activeTabId) ?? null;
