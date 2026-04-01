import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

import { Resizer } from "@/components/ui/Resizer";

// ─── Sidebar Root ─────────────────────────────────────────────────────────────
export function SidebarRoot({
  children,
  className,
  style,
  onResizeMouseDown,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onResizeMouseDown?: (e: React.MouseEvent) => void;
}) {
  return (
    <aside
      style={{ ...style, display: "flex", flexDirection: "row" }}
      className={cn("sidebar-root", className)}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {children}
      </div>
      {onResizeMouseDown && (
        <Resizer
          onMouseDown={onResizeMouseDown}
          className="sidebar-resizer"
        />
      )}
    </aside>
  );
}

// ─── Sidebar Header ───────────────────────────────────────────────────────────
interface SidebarHeaderProps {
  title: string;
  onAdd?: () => void;
  children?: React.ReactNode;
}

export function SidebarHeader({ title, onAdd, children }: SidebarHeaderProps) {
  return (
    <div className="sidebar-header">
      {children || (
        <>
          <span className="sidebar-title">{title}</span>
          {onAdd && (
            <Button onClick={onAdd} variant="icon" size="xs">
              <Plus size={14} />
            </Button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Sidebar List ─────────────────────────────────────────────────────────────
export function SidebarList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("sidebar-list", className)}>{children}</div>;
}

// ─── Sidebar Input ────────────────────────────────────────────────────────────
export function SidebarInput({
  value,
  onChange,
  onCommit,
  onCancel,
  placeholder,
}: any) {
  return (
    <div className="sidebar-input-wrap">
      <input
        autoFocus
        className="sidebar-inline-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => (!value.trim() ? onCancel() : onCommit())}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder={placeholder}
      />
    </div>
  );
}

// ─── Sidebar Item Base ────────────────────────────────────────────────────────
interface SidebarItemBaseProps {
  children: React.ReactNode;
  isActive?: boolean;
  isDragging?: boolean;
  onClick?: () => void;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
}

export const SidebarItemBase = React.forwardRef<
  HTMLDivElement,
  SidebarItemBaseProps
>(
  (
    {
      children,
      isActive,
      isDragging,
      onClick,
      onContextMenu,
      onMouseEnter,
      onMouseLeave,
      className,
      style,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
        className={cn(
          "sidebar-item",
          isActive && "is-active",
          isDragging && "is-dragging",
          className,
        )}
        style={style}
      >
        {children}
      </div>
    );
  },
);

SidebarItemBase.displayName = "SidebarItemBase";
