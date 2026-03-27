import { useState } from "react";
import {
  Plus,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { useCollectionsStore } from "@/features/collections/collections.store";
import { useTabsStore } from "@/features/tabs/tabs.store";
import { getMethodColor } from "@/utils/methodColor";
import type { Collection, CollectionItem } from "@/types";
import { Logo } from "../shared/Logo";
import { Button } from "../ui/button";
import { ContextMenu } from "../shared/ContextMenu";

function RequestItem({
  item,
  collectionId,
}: {
  item: CollectionItem;
  collectionId: string;
}) {
  const { removeItem, renameItem } = useCollectionsStore();
  const { openTab, tabs, setActiveTab } = useTabsStore();
  const [hovered, setHovered] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);

  const handleRename = () => {
    if (editName.trim() && editName !== item.name) {
      renameItem(collectionId, item.id, editName.trim());
    }
    setIsEditing(false);
  };

  function handleOpen() {
    if (!item.request) return;

    openTab({
      requestId: item.id,
      collectionId: collectionId,
      name: item.request.name,
      method: item.request.method,
      url: item.request.url,
      headers: item.request.headers,
      params: item.request.params,
      body: item.request.body,
      bodyType: item.request.bodyType,
      auth: item.request.auth,
      isDirty: false,
    });
  }

  if (isEditing) {
    return (
      <div style={{ padding: "2px 12px" }}>
        <input
          autoFocus
          style={styles.inlineInput}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") {
              setIsEditing(false);
              setEditName(item.name);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => item.request && handleOpen()}
      onContextMenu={(e) => {
        e.preventDefault();
        setMenuPos({ x: e.clientX, y: e.clientY });
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...styles.requestItem, ...(hovered ? styles.itemHover : {}) }}
    >
      <span
        style={{
          ...styles.methodLabel,
          color: getMethodColor(item.request!.method),
        }}
      >
        {item.request!.method}
      </span>
      <span style={styles.itemName}>{item.name}</span>

      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onClose={() => setMenuPos(null)}
          options={[
            { label: "Rename", onClick: () => setIsEditing(true) },
            { label: "Duplicate", onClick: () => console.log("Duplicate") },
            {
              label: "Delete",
              onClick: () => removeItem(collectionId, item.id),
              danger: true,
            },
          ]}
        />
      )}
    </div>
  );
}

function FolderItem({
  item,
  collectionId,
}: {
  item: CollectionItem;
  collectionId: string;
}) {
  const { toggleFolder, removeItem } = useCollectionsStore();
  const [hovered, setHovered] = useState(false);

  return (
    <div>
      <div
        onClick={() => toggleFolder(collectionId, item.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ ...styles.folderRow, ...(hovered ? styles.itemHover : {}) }}
      >
        {item.isOpen ? (
          <ChevronDown size={12} style={styles.chevron} />
        ) : (
          <ChevronRight size={12} style={styles.chevron} />
        )}
        {item.isOpen ? (
          <FolderOpen
            size={13}
            style={{ color: "var(--eos-accent)", flexShrink: 0 }}
          />
        ) : (
          <Folder
            size={13}
            style={{ color: "var(--eos-muted)", flexShrink: 0 }}
          />
        )}
        <span style={styles.itemName}>{item.name}</span>
        <Button
          variant="ghost-danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            removeItem(collectionId, item.id);
          }}
          style={{
            opacity: hovered ? 1 : 0,
            width: 24,
            height: 24,
            padding: 0,
          }}
        >
          <Trash2 size={12} />
        </Button>
      </div>

      {item.isOpen && item.children && item.children.length > 0 && (
        <div style={styles.children}>
          {item.children.map((child) =>
            child.type === "folder" ? (
              <FolderItem
                key={child.id}
                item={child}
                collectionId={collectionId}
              />
            ) : (
              <RequestItem
                key={child.id}
                item={child}
                collectionId={collectionId}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function CollectionBlock({ collection }: { collection: Collection }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [hovered, setHovered] = useState(false);
  const { addRequest, addFolder, removeCollection } = useCollectionsStore();

  function handleAddRequest() {
    if (!newName.trim()) return;
    addRequest(collection.id, {
      name: newName.trim(),
      method: "GET",
      url: "",
      headers: [],
      params: [],
      body: "",
      bodyType: "none",
      auth: { type: "none" },
    });
    setNewName("");
    setIsAdding(false);
  }

  return (
    <div style={styles.collectionBlock}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...styles.collectionHeader,
          ...(hovered ? styles.itemHover : {}),
        }}
      >
        <div onClick={() => setIsOpen(!isOpen)} style={styles.collectionTitle}>
          {isOpen ? (
            <ChevronDown size={13} style={styles.chevron} />
          ) : (
            <ChevronRight size={13} style={styles.chevron} />
          )}
          <span style={styles.collectionName}>{collection.name}</span>
        </div>

        <div style={{ ...styles.collectionActions, opacity: hovered ? 1 : 0 }}>
          <Button
            variant="icon"
            onClick={() => setIsAdding(true)}
            title="Add request"
            style={{ width: 24, height: 24 }}
          >
            <Plus size={13} />
          </Button>
          <Button
            variant="icon"
            onClick={() => addFolder(collection.id, "New Folder")}
            title="Add folder"
            style={{ width: 24, height: 24 }}
          >
            <FolderPlus size={13} />
          </Button>
          <Button
            variant="ghost-danger"
            size="sm"
            onClick={() => removeCollection(collection.id)}
            title="Delete collection"
            style={{ width: 24, height: 24, padding: 0 }}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div style={styles.collectionItems}>
          {collection.items.map((item) =>
            item.type === "folder" ? (
              <FolderItem
                key={item.id}
                item={item}
                collectionId={collection.id}
              />
            ) : (
              <RequestItem
                key={item.id}
                item={item}
                collectionId={collection.id}
              />
            ),
          )}
          {isAdding && (
            <div style={{ padding: "4px 8px" }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddRequest();
                  if (e.key === "Escape") {
                    setIsAdding(false);
                    setNewName("");
                  }
                }}
                placeholder="Request name..."
                style={styles.inlineInput}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { collections, addCollection } = useCollectionsStore();
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  function handleAddCollection() {
    if (!newCollectionName.trim()) return;
    addCollection(newCollectionName.trim());
    setNewCollectionName("");
    setIsAddingCollection(false);
  }

  return (
    <aside style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        <Logo size="sm" style={{ marginBottom: 0 }} />
        <Button
          variant="icon"
          onClick={() => setIsAddingCollection(true)}
          title="New collection"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* New collection input */}
      {isAddingCollection && (
        <div style={styles.newCollectionWrap}>
          <input
            autoFocus
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCollection();
              if (e.key === "Escape") {
                setIsAddingCollection(false);
                setNewCollectionName("");
              }
            }}
            placeholder="Collection name..."
            style={styles.inlineInput}
          />
        </div>
      )}

      {/* List */}
      <div style={styles.list}>
        {collections.length === 0 ? (
          <div style={styles.empty}>
            <p>No collections yet</p>
            <p style={{ color: "var(--eos-muted-2)", marginTop: 4 }}>
              Click + to create one
            </p>
          </div>
        ) : (
          collections.map((col) => (
            <CollectionBlock key={col.id} collection={col} />
          ))
        )}
      </div>
    </aside>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  sidebar: {
    width: 256,
    borderRight: "1px solid var(--eos-border)",
    background: "var(--eos-surface)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    flexShrink: 0,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderBottom: "1px solid var(--eos-border)",
    flexShrink: 0,
  },
  logo: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.05em",
    color: "var(--eos-accent)",
  },
  newCollectionWrap: {
    padding: "8px 12px",
    borderBottom: "1px solid var(--eos-border)",
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: 8,
  },
  empty: {
    textAlign: "center",
    color: "var(--eos-muted)",
    fontSize: 12,
    paddingTop: 32,
  },
  collectionBlock: {
    marginBottom: 4,
  },
  collectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 8px",
    borderRadius: "var(--radius)",
    cursor: "pointer",
    transition: "background 0.1s",
  },
  collectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  collectionName: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--eos-text)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  collectionActions: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    transition: "opacity 0.1s",
  },
  collectionItems: {
    marginLeft: 8,
  },
  requestItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "5px 12px",
    borderRadius: "var(--radius)",
    cursor: "pointer",
    transition: "background 0.1s",
  },
  folderRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 8px",
    borderRadius: "var(--radius)",
    cursor: "pointer",
    transition: "background 0.1s",
  },
  itemHover: {
    background: "var(--eos-surface-2)",
  },
  children: {
    marginLeft: 16,
    borderLeft: "1px solid var(--eos-border)",
    paddingLeft: 4,
  },
  methodLabel: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    width: 48,
    flexShrink: 0,
  },
  itemName: {
    fontSize: 12,
    color: "var(--eos-text)",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chevron: {
    color: "var(--eos-muted)",
    flexShrink: 0,
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--eos-muted)",
    transition: "color 0.1s",
    padding: 2,
    borderRadius: 4,
  },
  inlineInput: {
    width: "100%",
    background: "var(--eos-bg)",
    border: "1px solid var(--eos-accent)",
    borderRadius: "var(--radius)",
    padding: "4px 8px",
    fontSize: 12,
    color: "var(--eos-text)",
  },
} satisfies Record<string, React.CSSProperties>;
