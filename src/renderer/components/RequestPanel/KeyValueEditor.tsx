import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuid } from "uuid";
import type { KeyValuePair } from "@/types";
import { Button } from "../ui/button";

interface Props {
  data: KeyValuePair[];
  onChange: (data: KeyValuePair[]) => void;
  placeholder?: { key: string; value: string };
}

export function KeyValueEditor({ data, onChange, placeholder }: Props) {
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
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.colToggle} />
        <span style={{ ...styles.colHeader, flex: 1 }}>Key</span>
        <span style={{ ...styles.colHeader, flex: 1 }}>Value</span>
        <div style={styles.colAction} />
      </div>

      {/* Rows */}
      <div style={styles.rows}>
        {data.map((row) => (
          <KeyValueRow
            key={row.id}
            row={row}
            placeholder={placeholder}
            onChange={(patch) => updateRow(row.id, patch)}
            onRemove={() => removeRow(row.id)}
          />
        ))}

        {/* Empty state */}
        {data.length === 0 && <div style={styles.empty}>No items yet</div>}
      </div>

      {/* Add button */}
      <Button
        variant="ghost"
        onClick={addRow}
        style={{
          ...styles.addBtn,
          justifyContent: "center",
          borderTop: "1px solid var(--eos-border)",
          borderRadius: 0,
        }}
      >
        <Plus size={13} />
        <span>Add</span>
      </Button>
    </div>
  );
}

// ─── KeyValueRow ──────────────────────────────────────────────────────────────

function KeyValueRow({
  row,
  placeholder,
  onChange,
  onRemove,
}: {
  row: KeyValuePair;
  placeholder?: { key: string; value: string };
  onChange: (patch: Partial<KeyValuePair>) => void;
  onRemove: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.row,
        background: hovered ? "var(--eos-surface-2)" : "transparent",
        opacity: row.enabled ? 1 : 0.45,
      }}
    >
      {/* Toggle enabled */}
      <input
        type="checkbox"
        checked={row.enabled}
        onChange={(e) => onChange({ enabled: e.target.checked })}
        style={styles.checkbox}
      />

      {/* Key input */}
      <input
        value={row.key}
        onChange={(e) => onChange({ key: e.target.value })}
        placeholder={placeholder?.key ?? "key"}
        style={styles.input}
      />

      {/* Value input */}
      <input
        value={row.value}
        onChange={(e) => onChange({ value: e.target.value })}
        placeholder={placeholder?.value ?? "value"}
        style={styles.input}
      />

      {/* Delete */}
      <Button
        variant="ghost-danger"
        size="sm"
        onClick={onRemove}
        style={{ 
          opacity: hovered ? 1 : 0,
          width: 24,
          height: 24,
          padding: 0
        }}
      >
        <Trash2 size={13} />
      </Button>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  } as React.CSSProperties,
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderBottom: "1px solid var(--eos-border)",
    flexShrink: 0,
  } as React.CSSProperties,
  colToggle: {
    width: 16,
    flexShrink: 0,
  } as React.CSSProperties,
  colHeader: {
    fontSize: 11,
    color: "var(--eos-muted)",
    fontWeight: 500,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  } as React.CSSProperties,
  colAction: {
    width: 24,
    flexShrink: 0,
  } as React.CSSProperties,
  rows: {
    flex: 1,
    overflowY: "auto" as const,
  } as React.CSSProperties,
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 12px",
    transition: "background 0.1s",
  } as React.CSSProperties,
  empty: {
    textAlign: "center" as const,
    color: "var(--eos-muted)",
    fontSize: 12,
    padding: "24px 0",
  } as React.CSSProperties,
  checkbox: {
    width: 14,
    height: 14,
    flexShrink: 0,
    accentColor: "var(--eos-accent)",
    cursor: "pointer",
  } as React.CSSProperties,
  input: {
    flex: 1,
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 4,
    padding: "4px 8px",
    fontSize: 12,
    color: "var(--eos-text)",
    fontFamily: "var(--font-mono)",
    transition: "border-color 0.1s",
  } as React.CSSProperties,
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    fontSize: 12,
    color: "var(--eos-muted)",
    background: "transparent",
    borderTop: "1px solid var(--eos-border)",
    borderRadius: 0,
    cursor: "pointer",
    transition: "color 0.1s, background 0.1s",
    flexShrink: 0,
  } as React.CSSProperties,
} as const;
