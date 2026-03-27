import { TabBar } from "@/components/TabBar";
import { Sidebar } from "@/components/Sidebar";
import { RequestPanel } from "@/components/RequestPanel";
import { useZoom } from "@/hooks/useZoom";
import { ResponsePanel } from "@/features/request/ResponsePanel";
import { selectActiveTab, useTabsStore } from "@/features/tabs/tabs.store";
import { EmptyState } from "@/components/EmptyState";
import { useShortcuts } from "renderer/hooks/useShortcuts";
import { SaveRequestModal } from "renderer/features/collections/SaveRequestModal";
import { ActivityBar } from "renderer/components/ActivityBar";

export function MainScreen() {
  useShortcuts();
  useZoom();
  useTabsStore((state) => state.openTab);
  const activeTab = useTabsStore(selectActiveTab);
  const isSaveModalOpen = useTabsStore((s) => s.isSaveModalOpen);
  const setSaveModalOpen = useTabsStore((s) => s.setSaveModalOpen);

  return (
    <main style={styles.root}>
      <ActivityBar />
      <Sidebar />
      <div style={styles.main}>
        <TabBar />
        <div style={styles.panels}>
          {activeTab ? (
            <>
              <div style={styles.requestPanel}>
                <RequestPanel />
              </div>
              <div style={styles.responsePanel}>
                <ResponsePanel />
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
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
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  panels: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },
  requestPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid var(--eos-border)",
    overflow: "hidden",
  },
  responsePanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
} satisfies Record<string, React.CSSProperties>;
