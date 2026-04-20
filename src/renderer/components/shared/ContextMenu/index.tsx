import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import "./context-menu.css";

export type ContextMenuItem =
  | {
      label: string;
      icon?: React.ReactNode;
      onClick?: () => void;
      variant?: "default" | "danger";
      disabled?: boolean;
      type?: "item";
      submenu?: ContextMenuItem[];
    }
  | {
      type: "separator";
    };

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });
  const [activeSubmenu, setActiveSubmenu] = useState<{
    index: number;
    rect: DOMRect;
    items: ContextMenuItem[];
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      let newX = x;
      let newY = y;

      if (x + rect.width > window.innerWidth) {
        newX = x - rect.width;
      }
      if (y + rect.height > window.innerHeight) {
        newY = y - rect.height;
      }

      if (newX !== x || newY !== y) {
        setPosition({ x: newX, y: newY });
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [x, y, onClose]);

  const handleMouseEnter = (
    e: React.MouseEvent,
    index: number,
    submenuItems?: ContextMenuItem[]
  ) => {
    if (submenuItems) {
      const rect = e.currentTarget.getBoundingClientRect();
      setActiveSubmenu({ index, rect, items: submenuItems });
    } else {
      setActiveSubmenu(null);
    }
  };

  return createPortal(
    <>
      <div
        className="context-menu"
        ref={menuRef}
        style={{
          top: position.y,
          left: position.x,
        }}
      >
        {items.map((item, i) => {
          if (item.type === "separator") {
            return <div className="context-menu-separator" key={i} />;
          }

          const hasSubmenu = !!item.submenu;

          return (
            <button
              className={cn(
                "context-menu-item",
                item.variant === "danger" && "context-menu-danger",
                item.disabled && "context-menu-disabled",
                activeSubmenu?.index === i && "active"
              )}
              disabled={item.disabled}
              key={i}
              onMouseEnter={(e) => handleMouseEnter(e, i, item.submenu)}
              onClick={(e) => {
                e.stopPropagation();
                if (item.disabled || hasSubmenu) return;
                item.onClick?.();
                onClose();
              }}
            >
              {item.icon && (
                <span className="context-menu-icon">{item.icon}</span>
              )}
              <span className="context-menu-label">{item.label}</span>
              {hasSubmenu && (
                <ChevronRight size={14} className="context-menu-chevron" />
              )}
            </button>
          );
        })}
      </div>

      {activeSubmenu && (
        <SubMenu
          items={activeSubmenu.items}
          onClose={onClose}
          parentRect={activeSubmenu.rect}
        />
      )}
    </>,
    document.body
  );
}

function SubMenu({
  items,
  onClose,
  parentRect,
}: {
  items: ContextMenuItem[];
  onClose: () => void;
  parentRect: DOMRect;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      let x = parentRect.right;
      let y = parentRect.top - 4; // Align with parent item padding

      // Check right overflow
      if (x + rect.width > window.innerWidth) {
        x = parentRect.left - rect.width;
      }

      // Check bottom overflow
      if (y + rect.height > window.innerHeight) {
        y = window.innerHeight - rect.height - 8;
      }

      setPosition({ x, y });
    }
  }, [parentRect]);

  return (
    <div
      className="context-menu submenu"
      ref={menuRef}
      style={{
        top: position.y,
        left: position.x,
        visibility: position.x === 0 ? "hidden" : "visible",
      }}
    >
      {items.map((item, i) => {
        if (item.type === "separator") {
          return <div className="context-menu-separator" key={i} />;
        }
        return (
          <button
            className={cn(
              "context-menu-item",
              item.variant === "danger" && "context-menu-danger",
              item.disabled && "context-menu-disabled"
            )}
            disabled={item.disabled}
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              if (item.disabled) return;
              item.onClick?.();
              onClose();
            }}
          >
            {item.icon && <span className="context-menu-icon">{item.icon}</span>}
            <span className="context-menu-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
