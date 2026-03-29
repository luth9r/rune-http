import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "renderer/lib/utils";
import "./select.css";

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
  color?: string;
}

interface SelectProps<T extends string = string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  variant?: "default" | "method";
}

export function Select<T extends string = string>({
  value,
  options,
  onChange,
  className,
  variant = "default",
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={cn("sel", `sel--${variant}`, className)} ref={ref}>
      <div className="sel__sizer" aria-hidden>
        {
          options.reduce((a, b) => (a.label.length > b.label.length ? a : b))
            .label
        }
        <ChevronDown size={12} />
      </div>

      <button
        type="button"
        className={cn("sel__trigger", isOpen && "open")}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: selected?.color }}>
          {selected?.label ?? value}
        </span>
        <ChevronDown
          size={12}
          className={cn("sel__chevron", isOpen && "open")}
        />
      </button>

      {isOpen && (
        <div className="sel__dropdown">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={cn("sel__option", opt.value === value && "active")}
              style={{ color: opt.color }}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
