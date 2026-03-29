import { Modal } from "renderer/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ConfirmCloseProps {
  isOpen: boolean;
  tabName: string;
  onClose: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export function ConfirmCloseModal({
  isOpen,
  tabName,
  onClose,
  onDiscard,
  onSave,
}: ConfirmCloseProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unsaved Changes">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 13, color: "var(--eos-text)" }}>
          Request <strong>{tabName || "New Request"}</strong> has unsaved
          changes. Do you want to save them?
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button
            onClick={onDiscard}
            style={{ padding: "8px 12px" }}
            variant="ghost-danger"
          >
            Don't Save
          </Button>
          <Button onClick={onSave} variant="primary">
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
