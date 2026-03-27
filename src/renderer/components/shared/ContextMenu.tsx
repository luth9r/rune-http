// src/components/shared/ContextMenu.tsx
import { sharedStyles } from "@/styles/shared";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  options: { label: string; onClick: () => void; danger?: boolean }[];
}

export function ContextMenu({ x, y, onClose, options }: ContextMenuProps) {
  return (
    <>
      <div
        style={styles.overlay}
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div style={{ ...styles.menu, top: y, left: x }}>
        {options.map((opt, i) => (
          <button
            key={i}
            className={opt.danger ? "btn-ghost-danger" : "btn-icon"}
            style={{
              ...styles.item,
              color: opt.danger ? "var(--eos-error)" : "var(--eos-text)",
            }}
            onClick={() => {
              opt.onClick();
              onClose();
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  );
}

const styles = {
  overlay: { position: "fixed" as const, inset: 0, zIndex: 2000 },
  menu: {
    position: "fixed" as const,
    background: "var(--eos-surface)",
    border: "1px solid var(--eos-border)",
    borderRadius: "var(--radius)",
    padding: 4,
    minWidth: 160,
    zIndex: 2001,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
  },
  item: {
    width: "100%",
    padding: "6px 12px",
    justifyContent: "flex-start",
    fontSize: 12,
    borderRadius: 4,
  },
};
