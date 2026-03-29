import { Plus, Trash2, FolderOpen, File, Type, X } from "lucide-react";
import { v4 as uuid } from "uuid";
import { cn } from "@/lib/utils";
import type { KeyValuePair } from "@/types";
import { SmartInput } from "@/components/ui/smart-input";

interface Props {
  data: KeyValuePair[];
  onChange: (data: KeyValuePair[]) => void;
  placeholder?: { key: string; value: string };
  allowFileSelection?: boolean;
}

export function KeyValueEditor({
  data,
  onChange,
  placeholder,
  allowFileSelection,
}: Props) {
  function addRow() {
    onChange([...data, { id: uuid(), key: "", value: "", enabled: true }]);
  }

  function updateRow(id: string, patch: Partial<KeyValuePair>) {
    onChange(data.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function removeRow(id: string) {
    onChange(data.filter((row) => row.id !== id));
  }

  return (
    <div className={cn("kv", allowFileSelection && "kv--multipart")}>
      <div className="kv__header">
        <div className="kv__col-toggle" />
        <span className="kv__col-label">Key</span>
        <span className="kv__col-label">Value</span>
        {allowFileSelection && <span className="kv__col-label">Type</span>}
        <div className="kv__col-action" />
      </div>

      <div className="kv__rows">
        {data.map((row) => (
          <KeyValueRow
            key={row.id}
            row={row}
            placeholder={placeholder}
            allowFileSelection={allowFileSelection}
            onChange={(patch) => updateRow(row.id, patch)}
            onRemove={() => removeRow(row.id)}
          />
        ))}
      </div>

      <button className="kv__add" onClick={addRow}>
        <Plus size={13} />
        <span>Add</span>
      </button>
    </div>
  );
}

// ─── KeyValueRow ──────────────────────────────────────────────────────────────

function KeyValueRow({
  row,
  placeholder,
  allowFileSelection,
  onChange,
  onRemove,
}: {
  row: KeyValuePair;
  placeholder?: { key: string; value: string };
  allowFileSelection?: boolean;
  onChange: (patch: Partial<KeyValuePair>) => void;
  onRemove: () => void;
}) {
  const isFileType = row.type === "file";

  async function handleFileSelect() {
    try {
      const path = await (window as any).api.utils.selectFile();
      if (path) {
        onChange({ value: path });
      }
    } catch (err) {
      console.error("Failed to select file", err);
    }
  }

  return (
    <div
      className={cn(
        "kv__row",
        !row.enabled && "disabled",
        isFileType && "kv__row--file",
      )}
    >
      <input
        className="kv__checkbox"
        type="checkbox"
        checked={row.enabled}
        onChange={(e) => onChange({ enabled: e.target.checked })}
      />

      <div className="kv__cell">
        <SmartInput
          value={row.key}
          placeholder={placeholder?.key ?? "key"}
          onChange={(val) => onChange({ key: val })}
        />
      </div>

      <div className="kv__cell">
        {isFileType ? (
          <div className="kv__file-picker">
            <input
              className="kv__input--file-path"
              value={row.value || ""}
              readOnly
              placeholder="No file selected"
              onClick={handleFileSelect}
            />
            {row.value && (
              <button
                className="kv__file-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ value: "" });
                }}
              >
                <X size={14} />
              </button>
            )}
            <button className="kv__file-btn" onClick={handleFileSelect}>
              <FolderOpen size={14} />
            </button>
          </div>
        ) : (
          <SmartInput
            value={row.value}
            placeholder={placeholder?.value ?? "value"}
            onChange={(val) => onChange({ value: val })}
          />
        )}
      </div>

      {allowFileSelection && (
        <button
          className="kv__type-toggle"
          onClick={() =>
            onChange({ type: isFileType ? "text" : "file", value: "" })
          }
        >
          {isFileType ? <File size={14} /> : <Type size={14} />}
        </button>
      )}

      <button className="kv__delete" onClick={onRemove}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}
