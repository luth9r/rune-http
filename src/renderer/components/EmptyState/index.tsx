import { Plus } from "lucide-react";
import { useTabsStore } from "@/features/tabs/tabs.store";
import { Logo } from "@/components/shared/Logo";
import { Button } from "../ui/button";

export function EmptyState() {
  const openTab = useTabsStore((state) => state.openTab);

  return (
    <div style={styles.container}>
      <Logo size="lg" style={{ marginBottom: 48, opacity: 0.9 }} />

      <div style={styles.actions}>
        <Button 
          size="lg"
          onClick={() => openTab()}
          style={{ gap: 12 }}
        >
          <Plus size={18} />
          <span>New Request</span>
          <span style={styles.shortcut}>Ctrl+N</span>
        </Button>

        <p style={{ color: "var(--eos-muted)", fontSize: 13 }}>
          Press <kbd style={styles.kbd}>Ctrl+P</kbd> to search collections
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--eos-bg)",
    userSelect: "none",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
  },
  shortcut: {
    fontSize: 11,
    padding: "2px 6px",
    background: "rgba(0,0,0,0.2)",
    borderRadius: 4,
    marginLeft: 8,
    opacity: 0.8,
  },
  kbd: {
    fontFamily: "var(--font-mono)",
    background: "var(--eos-surface-2)",
    padding: "2px 4px",
    borderRadius: 4,
    border: "1px solid var(--eos-border)",
    fontSize: 12,
  },
} as const;
