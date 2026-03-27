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
  setTabLoading: (id: string, isLoading: boolean) => void;
  setTabResponse: (
    id: string,
    response: Tab["response"],
    error?: string | null,
  ) => void;
  markClean: (id: string) => void;
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
    immer((set) => ({
      tabs: [initialTab],
      activeTabId: initialTab.id,

      openTab: (overrides) =>
        set((state) => {
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
