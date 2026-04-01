import type React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Info, Save, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "renderer/components/shared/CodeEditor";
import { useEnvStore } from "@/features/environments/environments.store";
import { GLOBAL_ENV_ID } from "@/features/environments/environments.constants";
import type { Environment } from "@/types";

export function EnvEditor() {
  const { environments, activeEnvId, saveEnvironment, updateDraft } =
    useEnvStore();

  const activeEnv = useMemo(
    () => environments.find((e) => e.id === activeEnvId) || null,
    [environments, activeEnvId],
  );

  const [localValue, setLocalValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Load draft or initial value
  useEffect(() => {
    if (activeEnv) {
      const initialValue = activeEnv.draftValue ?? JSON.stringify(activeEnv.variables, null, 2);
      setLocalValue(initialValue);
      
      // Calculate initial dirty state
      const original = JSON.stringify(activeEnv.variables, null, 2);
      setIsDirty(initialValue !== original);
      
      // Validate initial value
      try {
        JSON.parse(initialValue);
        setError(null);
      } catch {
        setError("Invalid JSON");
      }
    }
  }, [activeEnvId, activeEnv?.id]); // Only reset when ID changes or mount

  const handleEditorChange = useCallback(
    (value: string) => {
      setLocalValue(value);

      if (!activeEnv) return;

      const original = JSON.stringify(activeEnv.variables, null, 2);
      const currentlyDirty = value !== original;
      setIsDirty(currentlyDirty);

      // Persist draft to store
      updateDraft(activeEnv.id, currentlyDirty ? value : null);

      try {
        JSON.parse(value);
        setError(null);
      } catch {
        setError("Invalid JSON");
      }
    },
    [activeEnv, updateDraft],
  );

  const handleSave = useCallback(() => {
    if (!activeEnv || error) return;
    try {
      const parsed = JSON.parse(localValue);
      const formatted = JSON.stringify(parsed, null, 2);
      saveEnvironment(activeEnv.id, parsed);
      setLocalValue(formatted);
      setIsDirty(false);
      setError(null);
    } catch {
      setError("Invalid JSON");
    }
  }, [activeEnv, localValue, error, saveEnvironment]);

  // Cmd/Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  const canSave = isDirty && !error;

  if (!activeEnv) {
    return (
      <div style={s.empty}>
        <Globe size={40} style={{ opacity: 0.15, marginBottom: 12 }} />
        <span style={{ fontSize: "var(--font-size-base)", color: "var(--eos-muted)" }}>
          Select an environment to edit variables
        </span>
      </div>
    );
  }

  return (
    <main style={s.main}>
      <div style={s.mainHead}>
        <div style={s.mainHeadLeft}>
          <div style={s.envName}>{activeEnv.name}</div>
          <div style={s.envHint}>
            Flat JSON object — use as{" "}
            <code style={s.code}>{"{{variable_name}}"}</code> in requests
          </div>
        </div>

        <div style={s.mainHeadRight}>
          {error && (
            <div style={s.errorBadge}>
              <Info size={13} />
              {error}
            </div>
          )}
          {isDirty && !error && <div style={s.dirtyBadge}>Unsaved changes</div>}
          <Button
            disabled={!canSave}
            onClick={handleSave}
            size="sm"
            style={{
              ...s.saveBtn,
              opacity: canSave ? 1 : 0.4,
              cursor: canSave ? "pointer" : "not-allowed",
              background: canSave
                ? "var(--eos-accent)"
                : "var(--eos-surface-2)",
            }}
            variant="primary"
          >
            <Save size={13} />
            Save
          </Button>
        </div>
      </div>

      <div style={s.editorWrap}>
        <CodeEditor
          bodyType="json"
          onChange={handleEditorChange}
          value={localValue}
        />
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  mainHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid var(--eos-border)",
    flexShrink: 0,
    gap: 16,
  },
  mainHeadLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    minWidth: 0,
  },
  mainHeadRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  envName: {
    fontSize: "calc(var(--font-size-base) + 2px)",
    fontWeight: 600,
  },
  envHint: {
    fontSize: "calc(var(--font-size-base) - 1px)",
    color: "var(--eos-muted)",
  },
  code: {
    fontFamily: "var(--font-mono)",
    fontSize: "calc(var(--font-size-base) - 2px)",
    background: "var(--eos-surface-2)",
    padding: "1px 5px",
    borderRadius: 3,
    color: "var(--eos-accent)",
  },
  errorBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    background: "color-mix(in srgb, var(--eos-error) 10%, transparent)",
    border: "1px solid color-mix(in srgb, var(--eos-error) 20%, transparent)",
    color: "var(--eos-error)",
    borderRadius: 6,
    fontSize: "calc(var(--font-size-base) - 1px)",
    whiteSpace: "nowrap",
  },
  dirtyBadge: {
    fontSize: "calc(var(--font-size-base) - 2px)",
    color: "var(--eos-muted)",
    whiteSpace: "nowrap",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.15s",
  },
  editorWrap: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
};
