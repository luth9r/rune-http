import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getMethodColor } from "@/utils/methodColor";
import type { HttpMethod } from "@/types";
import { Button } from "../ui/button";

const METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

interface Props {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

export function MethodSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={styles.root}>
      {/* Trigger */}
      <Button
        variant="secondary"
        onClick={() => setOpen(!open)}
        style={{
          ...styles.trigger,
          borderColor: open ? "var(--eos-accent)" : "var(--eos-border)",
        }}
      >
        <span style={{ ...styles.methodText, color: getMethodColor(value) }}>
          {value}
        </span>
        <ChevronDown
          size={12}
          style={{
            color: "var(--eos-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
            flexShrink: 0,
          }}
        />
      </Button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div style={styles.backdrop} onClick={() => setOpen(false)} />

          <div style={styles.dropdown}>
            {METHODS.map((method) => (
              <Button
                variant="ghost"
                key={method}
                onClick={() => {
                  onChange(method);
                  setOpen(false);
                }}
                style={{
                  ...styles.option,
                  color: getMethodColor(method),
                  justifyContent: "flex-start",
                }}
              >
                {method}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  root: {
    position: "relative",
    flexShrink: 0,
  } as React.CSSProperties,
  trigger: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "var(--eos-surface-2)",
    border: "1px solid var(--eos-border)",
    borderRadius: "var(--radius)",
    padding: "7px 10px",
    cursor: "pointer",
    transition: "border-color 0.15s",
    minWidth: 96,
  } as React.CSSProperties,
  methodText: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    flex: 1,
  } as React.CSSProperties,
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 10,
  } as React.CSSProperties,
  dropdown: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    zIndex: 20,
    background: "var(--eos-surface)",
    border: "1px solid var(--eos-border)",
    borderRadius: "var(--radius)",
    padding: 4,
    minWidth: 120,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  } as React.CSSProperties,
  option: {
    display: "block",
    width: "100%",
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    textAlign: "left",
    borderRadius: 4,
    cursor: "pointer",
    transition: "background 0.1s",
  } as React.CSSProperties,
} as const;
