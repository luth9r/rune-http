import { useState } from "react";
import { useCollectionsStore } from "./collections.store";
import { useTabsStore } from "@/features/tabs/tabs.store";
import { Modal } from "@/components/shared/Modal";
import { FolderTree } from "lucide-react";
import { v4 as uuid } from "uuid";
import { CollectionTree } from "renderer/components/shared/CollectionTree";
import { Button } from "@/components/ui/button";

export function SaveRequestModal({
  isOpen,
  onClose,
  tabId,
}: {
  isOpen: boolean;
  onClose: () => void;
  tabId: string;
}) {
  const collections = useCollectionsStore((s) => s.collections);
  const addRequest = useCollectionsStore((s) => s.addRequest);
  const { tabs, markClean, updateTab } = useTabsStore();

  const tab = tabs.find((t) => t.id === tabId);
  const [name, setName] = useState(tab?.name || "");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    colId: string;
    folderId?: string;
  } | null>(null);

  const handleSave = () => {
    if (!selectedLocation || !tab) return;
    const finalRequestId = uuid();

    addRequest(
      selectedLocation.colId,
      {
        name: name.trim() || "New Request",
        method: tab.method,
        url: tab.url,
        headers: tab.headers,
        params: tab.params,
        body: tab.body,
        bodyType: tab.bodyType,
        auth: tab.auth,
      },
      selectedLocation.folderId,
    );

    updateTab(tabId, {
      requestId: finalRequestId,
      collectionId: selectedLocation.colId,
      name: name.trim() || "New Request",
    });

    markClean(tabId);
    onClose();
  };

  const isColSelected = (colId: string) =>
    selectedLocation?.colId === colId && !selectedLocation.folderId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Request">
      <div style={localStyles.container}>
        <div style={localStyles.field}>
          <label style={localStyles.label}>Request Name</label>
          <input
            style={{
              ...styles.input,
              ...(isInputFocused ? styles.inputFocus : {}),
            }}
            autoFocus
            value={name}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="e.g. Get User Profile"
          />
        </div>

        <div style={localStyles.treeHeader}>Select Location</div>
        <div style={localStyles.treeBox}>
          {collections.map((col) => (
            <div key={col.id} style={localStyles.collectionGroup}>
              <Button
                variant="ghost"
                onClick={() => setSelectedLocation({ colId: col.id })}
                style={{
                  justifyContent: "flex-start",
                  padding: "8px",
                  width: "100%",
                  height: "auto",
                  backgroundColor: isColSelected(col.id)
                    ? "var(--eos-surface-2)"
                    : "transparent",
                  color: isColSelected(col.id)
                    ? "var(--eos-text)"
                    : "var(--eos-muted)",
                }}
              >
                <FolderTree
                  size={14}
                  style={{
                    color: "var(--eos-accent)",
                    marginRight: 8,
                    opacity: isColSelected(col.id) ? 1 : 0.7,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {col.name}
                </span>
              </Button>

              <CollectionTree
                items={col.items}
                showRequests={false}
                selectedId={selectedLocation?.folderId}
                onSelect={(item) =>
                  setSelectedLocation({ colId: col.id, folderId: item.id })
                }
              />
            </div>
          ))}
        </div>

        <div style={localStyles.footer}>
          <Button variant="ghost" style={{ marginRight: 8 }} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            disabled={!selectedLocation}
            onClick={handleSave}
            style={{
              opacity: selectedLocation ? 1 : 0.5,
            }}
          >
            Save Request
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const styles = {
  input: {
    background: "var(--eos-surface)",
    border: "1px solid var(--eos-border)",
    borderRadius: "var(--radius)",
    padding: "8px 12px",
    fontSize: 13,
    color: "var(--eos-text)",
    outline: "none",
    transition: "all 0.15s ease",
  },
  inputFocus: {
    borderColor: "var(--eos-accent)",
    boxShadow: "0 0 0 2px var(--eos-accent-dim)",
  },
};

const localStyles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
    width: 340,
  },
  field: { display: "flex", flexDirection: "column" as const, gap: 6 },
  label: {
    fontSize: 11,
    color: "var(--eos-muted)",
    fontWeight: 600,
    textTransform: "uppercase" as const,
  },
  treeHeader: {
    fontSize: 11,
    color: "var(--eos-muted)",
    fontWeight: 600,
    textTransform: "uppercase" as const,
  },
  collectionGroup: {
    marginBottom: 4,
    padding: 4,
  },
  treeBox: {
    border: "1px solid var(--eos-border)",
    borderRadius: "var(--radius)",
    maxHeight: "240px",
    overflowY: "auto" as const,
    background: "var(--eos-bg)",
    display: "flex",
    flexDirection: "column" as const,
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
  },
};
