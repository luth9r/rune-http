import { Database, Settings, Globe, FolderTree } from "lucide-react";
import { Button } from "../ui/button";

export function ActivityBar() {
  return (
    <div style={styles.activityBar}>
      <div style={styles.topSection}>
        <Button variant="tab" active={true} style={styles.actionBtn}>
          <FolderTree size={20} />
        </Button>
        <Button variant="tab" style={styles.actionBtn}>
          <Globe size={20} />
        </Button>
        <Button variant="tab" style={styles.actionBtn}>
          <Database size={20} />
        </Button>
      </div>

      <div style={styles.bottomSection}>
        <Button variant="tab" style={styles.actionBtn}>
          <Settings size={20} />
        </Button>
      </div>
    </div>
  );
}

const styles = {
  activityBar: {
    width: 48,
    background: "var(--eos-bg)",
    borderRight: "1px solid var(--eos-border)",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    padding: "12px 0",
    flexShrink: 0,
  },
  topSection: { display: "flex", flexDirection: "column" as const, gap: 8 },
  bottomSection: { display: "flex", flexDirection: "column" as const },
  actionBtn: { width: 48, height: 48, borderRadius: 0 },
};
