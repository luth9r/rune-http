import React, { useState } from "react";
import { useZoom } from "@/hooks/useZoom";
import { useShortcuts } from "renderer/hooks/useShortcuts";
import { useTabsStore, selectActiveTab } from "@/features/tabs/tabs.store";
import { ActivityBar } from "@/components/ActivityBar";
import { SaveRequestModal } from "@/components/shared/modals/SaveRequestModal";

import { HttpScreen } from "./HttpScreen";
import { EnvironmentsScreen } from "./EnvironmentsScreen";

export function MainScreen() {
  useShortcuts();
  useZoom();

  const [currentView, setView] = useState<
    "explorer" | "env" | "database" | "settings"
  >("explorer");

  const activeTab = useTabsStore(selectActiveTab);
  const isSaveModalOpen = useTabsStore((s) => s.isSaveModalOpen);
  const setSaveModalOpen = useTabsStore((s) => s.setSaveModalOpen);

  return (
    <main style={styles.root}>
      <ActivityBar currentView={currentView} setView={setView} />

      {currentView === "explorer" && <HttpScreen />}
      {currentView === "env" && <EnvironmentsScreen />}
      {currentView === "database" && (
        <div style={{ flex: 1 }}>Database Coming Soon</div>
      )}

      {isSaveModalOpen && activeTab && (
        <SaveRequestModal
          isOpen={isSaveModalOpen}
          onClose={() => setSaveModalOpen(false)}
          tabId={activeTab.id}
        />
      )}
    </main>
  );
}

const styles = {
  root: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    background: "var(--eos-bg)",
    color: "var(--eos-text)",
    overflow: "hidden",
  },
} as const;
