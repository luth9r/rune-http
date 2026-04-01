import React, { useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  size?: "default" | "sm";
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit,
  size = "default",
  className,
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const adjust = (delta: number) => {
    let newValue = value + delta;
    // Round to precision to avoid floating point issues
    const stepStr = step.toString();
    const precision = stepStr.indexOf(".") !== -1 ? stepStr.split(".")[1].length : 0;
    newValue = Number(newValue.toFixed(precision));
    
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      const stepStr = step.toString();
      const precision = stepStr.indexOf(".") !== -1 ? stepStr.split(".")[1].length : 0;
      onChange(Number(val.toFixed(precision)));
    }
  };

    const isSm = size === "sm";

    return (
      <div className={cn("number-input-group", className)} style={{ ...s.group, height: isSm ? 28 : 32 }}>
        <button
          type="button"
          onClick={() => adjust(-step)}
          disabled={value <= min}
          style={{ ...s.btn, width: isSm ? 28 : 32, borderRight: "1px solid var(--eos-border-2)" }}
          className="number-input-btn"
        >
          <Minus size={isSm ? 12 : 14} />
        </button>
        
        <div style={{ ...s.inputWrap, padding: isSm ? "0 4px" : "0 8px" }}>
          <input
            ref={inputRef}
            type="number"
            value={value}
            onChange={handleInputChange}
            style={{ ...s.input, fontSize: isSm ? 12 : 13 }}
            className="hide-spinners"
          />
          {unit && <span style={{ ...s.unit, fontSize: isSm ? 10 : 11 }}>{unit}</span>}
        </div>
  
        <button
          type="button"
          onClick={() => adjust(step)}
          disabled={value >= max}
          style={{ ...s.btn, width: isSm ? 28 : 32, borderLeft: "1px solid var(--eos-border-2)" }}
          className="number-input-btn"
        >
          <Plus size={isSm ? 12 : 14} />
        </button>

      <style>{`
        .hide-spinners::-webkit-outer-spin-button,
        .hide-spinners::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-spinners {
          -moz-appearance: textfield;
        }
        .number-input-btn:hover:not(:disabled) {
          background: var(--eos-surface-2) !important;
          color: var(--eos-accent) !important;
        }
        .number-input-btn:active:not(:disabled) {
          transform: scale(0.95);
        }
        .number-input-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  group: {
    display: "flex",
    alignItems: "stretch",
    background: "var(--eos-surface)",
    border: "1px solid var(--eos-border)",
    borderRadius: 6,
    overflow: "hidden",
    height: 32,
  },
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    background: "transparent",
    border: "none",
    color: "var(--eos-text)",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    gap: 4,
    minWidth: 40,
  },
  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    color: "var(--eos-text)",
    fontSize: 13,
    fontWeight: 600,
    textAlign: "center",
    outline: "none",
    padding: 0,
    margin: 0,
  },
  unit: {
    fontSize: 11,
    color: "var(--eos-muted)",
    fontWeight: 500,
  }
};
