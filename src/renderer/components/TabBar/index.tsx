import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useTabsStore } from "@/features/tabs/tabs.store";
import type { Tab } from "@/types";
import { getMethodColor } from "@/utils";
import { sharedStyles } from "styles/shared";
import { ConfirmCloseModal } from "../shared/ConfirmCloseModal";
import { Button } from "../ui/button";

function TabItem({
  tab,
  isActive,
  onClose,
}: {
  tab: Tab;
  isActive: boolean;
  onClose: () => void;
}) {
  const { setActiveTab } = useTabsStore();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => setActiveTab(tab.id)}
      onMouseDown={(e) => e.button === 1 && onClose()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.tab,
        ...(hovered && !isActive ? styles.tabHover : {}),
        ...(isActive ? styles.tabActive : {}),
      }}
    >
      <span style={{ ...styles.method, color: getMethodColor(tab.method) }}>
        {tab.method}
      </span>

      <span style={styles.tabName}>{tab.name || "New Request"}</span>

      <div style={styles.tabActionGroup}>
        {tab.isDirty && <span style={styles.dirtyDot} />}

        {(hovered || isActive) && (
          <Button
            variant="ghost-danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              width: 18,
              height: 18,
              padding: 0,
            }}
          >
            <X size={12} />
          </Button>
        )}

        {!(hovered || isActive) && <div style={{ width: 18 }} />}
      </div>
    </div>
  );
}

export function TabBar() {
  const { tabs, activeTabId, openTab, closeTab, setSaveModalOpen } =
    useTabsStore();

  const [tabToConfirm, setTabToConfirm] = useState<Tab | null>(null);

  const handleAttemptClose = (tab: Tab) => {
    if (tab.isDirty) {
      setTabToConfirm(tab);
    } else {
      closeTab(tab.id);
    }
  };

  return (
    <div style={styles.container}>
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          onClose={() => handleAttemptClose(tab)}
        />
      ))}

      <Button
        variant="icon"
        onClick={() => openTab()}
        style={{ width: 40, height: 40 }}
      >
        <Plus size={16} />
      </Button>

      {tabToConfirm && (
        <ConfirmCloseModal
          isOpen={!!tabToConfirm}
          tabName={tabToConfirm.name}
          onClose={() => setTabToConfirm(null)}
          onDiscard={() => {
            closeTab(tabToConfirm.id);
            setTabToConfirm(null);
          }}
          onSave={() => {
            setTabToConfirm(null);
            setSaveModalOpen(true);
          }}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "stretch",
    borderBottom: "1px solid var(--eos-border)",
    background: "var(--eos-surface)",
    height: 40,
    overflowX: "auto",
    flexShrink: 0,
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 12px",
    cursor: "pointer",
    borderTopWidth: "2px",
    borderTopStyle: "solid" as const,
    borderTopColor: "transparent",
    whiteSpace: "nowrap" as const,
    minWidth: 0,
    maxWidth: 192,
    background: "var(--eos-surface)",
    color: "var(--eos-muted)",
    userSelect: "none" as const,
    transition: "background 0.1s, color 0.1s",
    position: "relative" as const,
  },
  tabHover: {
    background: "var(--eos-bg)",
    color: "var(--eos-text)",
  },
  tabActive: {
    background: "var(--eos-bg)",
    color: "var(--eos-text)",
    borderTopColor: "var(--eos-accent)",
  },
  method: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    flexShrink: 0,
  },
  tabName: {
    fontSize: 12,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } as React.CSSProperties,
  tabAction: {
    flexShrink: 0,
    width: 16,
    height: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tabActionGroup: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
    minWidth: 18,
    justifyContent: "flex-end",
  },
  dirtyDot: {
    width: 6,
    zIndex: 100,
    height: 6,
    borderRadius: "50%",
    background: "var(--eos-accent)",
    display: "block",
  },
} satisfies Record<string, React.CSSProperties>;
