import React from "react";

export const sharedStyles = {
  actionIconButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    borderRadius: "var(--radius)",
    transition: "all var(--transition-fast)",
    color: "var(--eos-muted)",
    outline: "none",
  } as React.CSSProperties,

  primaryButton: {
    padding: "8px 16px",
    background: "var(--eos-accent)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--radius)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "var(--font-sans)",
    transition: "all var(--transition-normal)",
  } as React.CSSProperties,

  dangerButton: {
    padding: "8px 16px",
    background: "transparent",
    color: "var(--eos-delete)",
    border: "1px solid var(--eos-delete)",
    borderRadius: "var(--radius)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    transition: "all var(--transition-normal)",
  } as React.CSSProperties,

  input: {
    background: "var(--input)",
    border: "1px solid var(--eos-border)",
    padding: "8px 12px",
    color: "var(--eos-text)",
    borderRadius: "var(--radius)",
    fontSize: "13px",
    fontFamily: "var(--font-sans)",
    outline: "none",
    transition: "all var(--transition-normal)",
  } as React.CSSProperties,

  inputFocus: {
    borderColor: "var(--eos-accent)",
    boxShadow: "0 0 0 2px var(--eos-accent-dim)",
  } as React.CSSProperties,
};
