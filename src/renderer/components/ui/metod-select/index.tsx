import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getMethodColor } from "@/utils/methodColor";
import type { HttpMethod } from "@/types";
import "./method-select.css";

const METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

interface MethodSelectProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

export function MethodSelect({ value, onChange }: MethodSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="method-select">
      <button
        className={`method-select__trigger${open ? " open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span
          className="method-select__value"
          style={{ color: getMethodColor(value) }}
        >
          {value}
        </span>
        <ChevronDown
          size={12}
          className={`method-select__chevron${open ? " open" : ""}`}
        />
      </button>

      {open && (
        <>
          <div
            className="method-select__backdrop"
            onClick={() => setOpen(false)}
          />
          <div className="method-select__dropdown">
            {METHODS.map((method) => (
              <button
                key={method}
                className="method-select__option"
                style={{ color: getMethodColor(method) }}
                onClick={() => {
                  onChange(method);
                  setOpen(false);
                }}
              >
                {method}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
