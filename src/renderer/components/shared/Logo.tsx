import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

export function Logo({ size = "md", style }: LogoProps) {
  const sizes = {
    sm: { fontSize: 14, gap: 6, runeSize: 18 },
    md: { fontSize: 20, gap: 8, runeSize: 24 },
    lg: { fontSize: 32, gap: 12, runeSize: 40 },
  };

  const current = sizes[size];

  return (
    <div style={{ ...styles.container, gap: current.gap, ...style }}>
      <span style={{ ...styles.rune, fontSize: current.runeSize }}>ᚱ</span>
      <span style={{ ...styles.text, fontSize: current.fontSize }}>
        Rune <span style={styles.subtext}>HTTP</span>
      </span>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    userSelect: "none",
    fontFamily: "var(--font-sans)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  rune: {
    color: "var(--eos-accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "var(--eos-text)",
    whiteSpace: "nowrap",
  },
  subtext: {
    color: "var(--eos-muted)",
    fontWeight: 400,
  },
} as const;
