import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function EmptyCollectionZone({
  collectionId,
  isActive,
  style,
}: {
  collectionId: string;
  isActive: boolean;
  style?: React.CSSProperties;
}) {
  const { setNodeRef } = useDroppable({
    id: `empty-${collectionId}`,
    data: { type: "emptyCollection", collectionId },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        height: isActive ? 28 : 8,
        borderRadius: "var(--radius)",
        border: isActive
          ? "1px dashed var(--eos-accent)"
          : "1px dashed transparent",
        background: isActive
          ? "color-mix(in srgb, var(--eos-accent) 8%, transparent)"
          : "transparent",
      }}
    />
  );
}
