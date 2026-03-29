import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEnvStore } from "@/features/environments/environments.store";
import { GLOBAL_ENV_ID } from "@/features/environments/environments.constants";
import "./smart-input.css";

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "password";
  className?: string;
  variant?: "default" | "plain";
}

function useEnvVars(): Record<string, string> {
  const environments = useEnvStore((s) => s.environments);
  const activeEnvId = useEnvStore((s) => s.activeEnvId);
  const globalEnv = environments.find((e) => e.id === GLOBAL_ENV_ID);
  const activeEnv = environments.find((e) => e.id === activeEnvId);
  return { ...globalEnv?.variables, ...activeEnv?.variables };
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toHtml(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{([\w.-]+)\}\}/g, (_, name) => {
    const cls = name in vars ? "resolved" : "unresolved";
    return `<span class="si-var ${cls}" contenteditable="false" data-varname="${escapeHtml(name)}">{{${escapeHtml(name)}}}</span>`;
  });
}

function getCaretOffset(el: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return 0;
  const range = sel.getRangeAt(0);
  let offset = 0;
  function walk(node: Node): boolean {
    if (node === range.endContainer) {
      offset += range.endOffset;
      return true;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      offset += node.textContent?.length ?? 0;
      return false;
    }
    if (node instanceof HTMLElement && node.contentEditable === "false") {
      if (node.contains(range.endContainer)) {
        offset += node.textContent?.length ?? 0;
        return true;
      }
      offset += node.textContent?.length ?? 0;
      return false;
    }
    for (const child of node.childNodes) {
      if (walk(child)) return true;
    }
    return false;
  }
  walk(el);
  return offset;
}

function setCaretOffset(el: HTMLElement, offset: number) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  let rem = offset;
  let found = false;
  function walk(node: Node) {
    if (found) return;
    if (node instanceof HTMLElement && node.contentEditable === "false") {
      const len = node.textContent?.length ?? 0;
      if (rem <= 0) {
        range.setStartBefore(node);
        range.collapse(true);
        found = true;
      } else if (rem < len) {
        range.setStartAfter(node);
        range.collapse(true);
        found = true;
      } else rem -= len;
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent?.length ?? 0;
      if (rem <= len) {
        range.setStart(node, rem);
        range.collapse(true);
        found = true;
      } else rem -= len;
    } else node.childNodes.forEach(walk);
  }
  walk(el);
  if (!found) {
    range.selectNodeContents(el);
    range.collapse(false);
  }
  sel.removeAllRanges();
  sel.addRange(range);
}

function scrollToCaret(el: HTMLElement) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(true);
  const rect = range.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  if (rect.right > elRect.right) {
    el.scrollLeft += rect.right - elRect.right + 4;
  } else if (rect.left < elRect.left) {
    el.scrollLeft -= elRect.left - rect.left + 4;
  }
}

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

export function SmartInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  variant = "default",
}: SmartInputProps) {
  const vars = useEnvVars();
  const [showPassword, setShowPassword] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    pos: number;
    matches: string[];
    activeIndex: number;
  } | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const isFocused = useRef(false);
  const lastValue = useRef(value);

  const isPassword = type === "password";

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    lastValue.current = value;
    el.innerHTML = toHtml(value, vars);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = editorRef.current;
    if (!el || isFocused.current) return;
    if (lastValue.current === value) return;
    lastValue.current = value;
    el.innerHTML = toHtml(value, vars);
  }, [value, vars]);

  const handleMouseOver = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("si-var") && target.dataset.varname) {
        const val = vars[target.dataset.varname];
        if (!val) return;
        const rect = target.getBoundingClientRect();
        setTooltip({
          text: val,
          x: rect.left + rect.width / 2,
          y: rect.top - 6,
        });
      }
    },
    [vars],
  );

  const handleMouseOut = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains("si-var"))
      setTooltip(null);
  }, []);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const caret = getCaretOffset(el);
    const text = el.innerText.replace(/\n/g, "");
    if (text === lastValue.current) return;
    lastValue.current = text;
    onChange(text);
    el.innerHTML = toHtml(text, vars);
    setCaretOffset(el, Math.min(caret, text.length));
    scrollToCaret(el);

    if (!isPassword || showPassword) {
      const before = text.slice(0, caret);
      const match = before.match(/\{\{([\w.-]*)$/);
      if (match) {
        const query = match[1].toLowerCase();
        const matches = Object.keys(vars).filter((k) =>
          k.toLowerCase().startsWith(query),
        );
        setSuggestion(
          matches.length ? { pos: caret, matches, activeIndex: 0 } : null,
        );
      } else {
        setSuggestion(null);
      }
    }
  }, [onChange, vars, isPassword, showPassword]);

  const applySuggestion = useCallback(
    (varName: string) => {
      const el = editorRef.current;
      if (!suggestion || !el) return;
      const before = value.slice(0, suggestion.pos);
      const start = before.lastIndexOf("{{");
      const after = value.slice(suggestion.pos);
      const newValue =
        value.slice(0, start) +
        `{{${varName}}}` +
        (after.startsWith("}}") ? after.slice(2) : after);
      lastValue.current = newValue;
      onChange(newValue);
      setSuggestion(null);
      el.innerHTML = toHtml(newValue, vars);
      el.focus();
      setCaretOffset(el, start + varName.length + 4);
      scrollToCaret(el);
    },
    [suggestion, value, onChange, vars],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      return;
    }
    if (!suggestion) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestion((s) =>
        s ? { ...s, activeIndex: (s.activeIndex + 1) % s.matches.length } : s,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestion((s) =>
        s
          ? {
              ...s,
              activeIndex:
                (s.activeIndex - 1 + s.matches.length) % s.matches.length,
            }
          : s,
      );
    } else if (e.key === "Tab") {
      e.preventDefault();
      applySuggestion(suggestion.matches[suggestion.activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSuggestion(null);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
      const el = editorRef.current;
      if (el) scrollToCaret(el);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !editorRef.current?.closest(".smart-input")?.contains(e.target as Node)
      )
        setSuggestion(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={cn("smart-input", `smart-input--${variant}`, className)}>
      {isPassword && (
        <input
          className="smart-input__input smart-input__input--password"
          style={{ display: showPassword ? "none" : undefined }}
          type="password"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      <div
        ref={editorRef}
        className={cn(
          "smart-input__editor",
          isPassword && "smart-input__editor--password",
        )}
        style={{ display: isPassword && !showPassword ? "none" : undefined }}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onFocus={() => {
          isFocused.current = true;
        }}
        onBlur={() => {
          isFocused.current = false;
          const el = editorRef.current;
          if (el) el.innerHTML = toHtml(value, vars);
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onPaste={(e) => {
          e.preventDefault();
          document.execCommand(
            "insertText",
            false,
            e.clipboardData.getData("text/plain"),
          );
        }}
        spellCheck={false}
      />

      {isPassword && (
        <button
          type="button"
          className="smart-input__eye"
          onClick={() => {
            const next = !showPassword;
            setShowPassword(next);
            if (next) {
              requestAnimationFrame(() => {
                const el = editorRef.current;
                if (!el) return;
                lastValue.current = value;
                el.innerHTML = toHtml(value, vars);
                el.focus();
                setCaretOffset(el, value.length);
                scrollToCaret(el);
              });
            }
          }}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      )}

      {(!isPassword || showPassword) && suggestion && (
        <div className="smart-input__suggestions">
          {suggestion.matches.map((name, i) => (
            <button
              key={name}
              type="button"
              className={cn(
                "smart-input__suggestion",
                i === suggestion.activeIndex && "active",
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                applySuggestion(name);
              }}
              onMouseEnter={() =>
                setSuggestion((s) => (s ? { ...s, activeIndex: i } : s))
              }
            >
              <span className="smart-input__sug-name">{name}</span>
              <span className="smart-input__sug-value">
                {typeof vars[name] === "object"
                  ? JSON.stringify(vars[name])
                  : vars[name]}
              </span>
            </button>
          ))}
        </div>
      )}

      {tooltip &&
        createPortal(
          <div
            className="si-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {typeof tooltip.text === "object"
              ? JSON.stringify(tooltip.text)
              : tooltip.text}
          </div>,
          document.body,
        )}
    </div>
  );
}
