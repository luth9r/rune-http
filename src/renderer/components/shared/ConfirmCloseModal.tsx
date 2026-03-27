import { Modal } from "@/components/shared/Modal";
import { Button } from "../ui/button";

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
            variant="ghost-danger"
            style={{ padding: "8px 12px" }}
            onClick={onDiscard}
          >
            Don't Save
          </Button>
          <Button variant="default" onClick={onSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
