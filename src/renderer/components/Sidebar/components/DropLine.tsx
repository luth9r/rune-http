import React from "react";

export function DropLine({ indent = 24 }: { indent?: number }) {
  return (
    <div
      style={{
        position: "relative",
        height: 0,
        marginLeft: indent,
        marginRight: 8,
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -1,
          left: 0,
          right: 0,
          height: 2,
          borderRadius: 1,
          background: "var(--eos-accent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -3,
          left: -4,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--eos-accent)",
        }}
      />
    </div>
  );
}
