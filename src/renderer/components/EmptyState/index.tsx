import { Plus } from "lucide-react";
import { useTabsStore } from "@/features/tabs/tabs.store";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import "./empty-state.css";

export function EmptyState() {
  const openTab = useTabsStore((state) => state.openTab);

  return (
    <div className="empty-state">
      <Logo className="empty-state-logo" size="lg" />

      <div className="empty-state-actions">
        <Button
          className="empty-state-btn"
          onClick={() => openTab()}
          size="lg"
          variant="primary"
        >
          <Plus size={18} />
          <span>New Request</span>
          <span className="empty-state-shortcut">Ctrl+N</span>
        </Button>

        <p className="empty-state-hint">
          Press <kbd className="kbd">Ctrl+N</kbd> to search collections
        </p>
      </div>
    </div>
  );
}
