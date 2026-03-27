import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.content} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>{title}</span>
          <Button
            variant="icon"
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
            }}
          >
            <X size={18} />
          </Button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(2px)",
  },
  content: {
    background: "var(--eos-surface)",
    border: "1px solid var(--eos-border)",
    borderRadius: "var(--radius)",
    minWidth: 420,
    maxWidth: "90vw",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--eos-border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--eos-surface)",
  },
  title: {
    fontWeight: 700,
    fontSize: 13,
    color: "var(--eos-text)",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  },
  body: {
    padding: 20,
    maxHeight: "80vh",
    overflowY: "auto",
  },
} as const;
