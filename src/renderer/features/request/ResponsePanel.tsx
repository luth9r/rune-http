import { useState, useMemo, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { useTabsStore, selectActiveTab } from "@/features/tabs/tabs.store";
import { JsonViewer } from "@/components/shared/JsonViewer";

const RESPONSE_TABS = ["Body", "Headers"] as const;
type ResponseTab = (typeof RESPONSE_TABS)[number];

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return "var(--eos-post)";
  if (status >= 300 && status < 400) return "var(--eos-put)";
  return "var(--eos-delete)";
}

export function ResponsePanel() {
  const tab = useTabsStore(selectActiveTab);
  const [activeTab, setActiveTab] = useState<ResponseTab>("Body");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!tab?.response?.body) return;
    navigator.clipboard.writeText(tab.response.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [tab?.response?.body]);

  const parsedBody = useMemo(() => {
    if (!tab?.response?.body) return null;
    try {
      return JSON.parse(tab.response.body);
    } catch {
      return null;
    }
  }, [tab?.response?.body]);

  if (!tab) return null;

  if (tab.isLoading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <span style={styles.hint}>Sending request...</span>
      </div>
    );
  }

  if (tab.error || !tab.response) {
    return (
      <div style={styles.centered}>
        <span
          style={
            tab.error
              ? { ...styles.hint, color: "var(--eos-delete)" }
              : styles.hint
          }
        >
          {tab.error || "Send a request to see the response"}
        </span>
      </div>
    );
  }

  const { response } = tab;

  return (
    <div style={styles.root}>
      {/* Status bar */}
      <div style={styles.statusBar}>
        <span
          style={{
            ...styles.statusBadge,
            color: getStatusColor(response.status),
            borderColor: getStatusColor(response.status),
          }}
        >
          {response.status} {response.statusText}
        </span>
        <span style={styles.meta}>{response.duration} ms</span>
        <span style={styles.metaDivider}>·</span>
        <span style={styles.meta}>{response.size} B</span>
      </div>

      {/* Tabs */}
      <div style={styles.tabsBar}>
        {RESPONSE_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === t ? styles.tabBtnActive : {}),
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === "Body" && (
          <div style={styles.bodyWrapper}>
            <button
              style={{
                ...styles.copyBtn,
                ...(copied ? styles.copyBtnSuccess : {}),
              }}
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <div style={{ padding: "12px" }}>
              {parsedBody ? (
                <JsonViewer src={parsedBody} />
              ) : (
                <pre style={styles.body}>{response.body}</pre>
              )}
            </div>
          </div>
        )}

        {activeTab === "Headers" && (
          <div style={styles.headersTable}>
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} style={styles.headerRow}>
                <span style={styles.headerKey}>{key}</span>
                <span style={styles.headerValue}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 12,
  },
  hint: { fontSize: 13, color: "var(--eos-muted)" },
  spinner: {
    width: 20,
    height: 20,
    border: "2px solid var(--eos-border)",
    borderTopColor: "var(--eos-accent)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  statusBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    borderBottom: "1px solid var(--eos-border)",
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    border: "1px solid",
    borderRadius: 4,
    padding: "1px 6px",
  },
  meta: {
    fontSize: 11,
    color: "var(--eos-muted)",
    fontFamily: "var(--font-mono)",
  },
  metaDivider: { color: "var(--eos-border)", fontSize: 12 },
  tabsBar: {
    display: "flex",
    borderBottom: "1px solid var(--eos-border)",
    padding: "0 12px",
    gap: 4,
  },
  tabBtn: {
    padding: "8px 12px",
    fontSize: 12,
    color: "var(--eos-muted)",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  tabBtnActive: {
    color: "var(--eos-text)",
    borderBottom: "2px solid var(--eos-accent)",
  },
  content: { flex: 1, overflow: "auto", position: "relative" },
  bodyWrapper: { position: "relative", minHeight: "100%" },
  copyBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--eos-surface-2)",
    border: "1px solid var(--eos-border)",
    borderRadius: 4,
    color: "var(--eos-muted)",
    cursor: "pointer",
    opacity: 0.6,
  },
  copyBtnSuccess: {
    color: "var(--eos-post)",
    borderColor: "var(--eos-post)",
    opacity: 1,
  },
  body: {
    margin: 0,
    padding: 16,
    fontSize: 13,
    fontFamily: "var(--font-mono)",
    color: "var(--eos-text)",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  headersTable: { padding: "4px 0" },
  headerRow: { display: "flex", gap: 16, padding: "4px 16px", fontSize: 12 },
  headerKey: {
    color: "var(--eos-accent)",
    fontFamily: "var(--font-mono)",
    width: 160,
    flexShrink: 0,
  },
  headerValue: {
    color: "var(--eos-text)",
    fontFamily: "var(--font-mono)",
    wordBreak: "break-all",
  },
} satisfies Record<string, React.CSSProperties>;

const eosJsonTheme = {
  base00: "transparent", // Background
  base01: "var(--eos-surface-2)", // Toolbar
  base02: "var(--eos-border)", // Borders
  base03: "var(--eos-muted)", // Item counts
  base04: "var(--eos-muted-2)", // Double quotes
  base05: "var(--eos-text)", // Default text
  base06: "var(--eos-text)",
  base07: "var(--eos-accent)", // Keys
  base08: "var(--eos-delete)", // Error
  base09: "var(--eos-get)", // Numbers
  base0A: "var(--eos-put)", // Booleans
  base0B: "var(--eos-post)", // Strings
  base0C: "var(--eos-head)", // Regex
  base0D: "var(--eos-accent-h)", // Expand/Collapse arrows
  base0E: "var(--eos-patch)", // Functions
  base0F: "var(--eos-options)", // Null
};
