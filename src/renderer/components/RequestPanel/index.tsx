import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useTabsStore, selectActiveTab } from "@/features/tabs/tabs.store";
import { useHttpRequest } from "@/hooks/useHttpRequest";
import { MethodSelect } from "./MethodSelect";
import { KeyValueEditor } from "./KeyValueEditor";
import { CodeEditor } from "@/components/shared/CodeEditor";
import type { AuthConfig, AuthType, BodyType } from "@/types";
import { useCollectionsStore } from "@/features/collections/collections.store";

const BODY_TABS: { label: string; value: BodyType }[] = [
  { label: "None", value: "none" },
  { label: "JSON", value: "json" },
  { label: "Text", value: "text" },
  { label: "Form", value: "urlencoded" },
];

const REQUEST_TABS = ["Params", "Headers", "Body", "Auth"] as const;
type RequestTab = (typeof REQUEST_TABS)[number];

export function RequestPanel() {
  const { sendRequest } = useHttpRequest();
  const [activeTab, setActiveTab] = useState<RequestTab>("Body");
  const [urlFocused, setUrlFocused] = useState(false);
  const tab = useTabsStore(selectActiveTab);
  const { updateTab, markClean } = useTabsStore();
  const updateCollectionRequest = useCollectionsStore(
    (state) => state.updateRequest,
  );

  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();

        if (tab && tab.isDirty) {
          let finalBody = tab.body;

          if (tab.bodyType === "json" && tab.body) {
            try {
              finalBody = JSON.stringify(JSON.parse(tab.body), null, 2);
              updateTab(tab.id, { body: finalBody });
            } catch (e) {}
          }

          if (tab.collectionId && tab.requestId) {
            updateCollectionRequest(tab.collectionId, tab.requestId, {
              method: tab.method,
              url: tab.url,
              headers: tab.headers,
              params: tab.params,
              body: finalBody,
              bodyType: tab.bodyType,
              auth: tab.auth,
            });
          }

          markClean(tab.id);
        }
      }
    };

    window.addEventListener("keydown", handleSave);
    return () => window.removeEventListener("keydown", handleSave);
  }, [tab, updateCollectionRequest, markClean, updateTab]);

  if (!tab) return <div style={styles.empty}>No active tab</div>;

  return (
    <div style={styles.root}>
      {/* URL Bar */}
      <div style={styles.urlBar}>
        <MethodSelect
          value={tab.method}
          onChange={(method) => updateTab(tab.id, { method })}
        />
        <input
          value={tab.url}
          onChange={(e) => updateTab(tab.id, { url: e.target.value })}
          onFocus={() => setUrlFocused(true)}
          onBlur={() => setUrlFocused(false)}
          placeholder="http://localhost:3000/api"
          style={{
            ...styles.urlInput,
            borderColor: urlFocused ? "var(--eos-accent)" : "var(--eos-border)",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendRequest(tab.id);
          }}
        />
        <button
          onClick={() => sendRequest(tab.id)}
          disabled={tab.isLoading || !tab.url}
          style={{
            ...styles.sendBtn,
            opacity: tab.isLoading || !tab.url ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!tab.isLoading && tab.url)
              e.currentTarget.style.background = "var(--eos-accent-h)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--eos-accent)";
          }}
        >
          <Send size={14} />
          <span>{tab.isLoading ? "Sending..." : "Send"}</span>
        </button>
      </div>

      {/* Inner tabs */}
      <div style={styles.tabsBar}>
        {REQUEST_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === t ? styles.tabBtnActive : {}),
            }}
            onMouseEnter={(e) => {
              if (activeTab !== t)
                e.currentTarget.style.color = "var(--eos-text)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== t)
                e.currentTarget.style.color = "var(--eos-muted)";
            }}
          >
            {t}
            {t === "Params" &&
              tab.params.filter((p) => p.enabled && p.key).length > 0 && (
                <span style={styles.badge}>
                  {tab.params.filter((p) => p.enabled && p.key).length}
                </span>
              )}
            {t === "Headers" &&
              tab.headers.filter((h) => h.enabled && h.key).length > 0 && (
                <span style={styles.badge}>
                  {tab.headers.filter((h) => h.enabled && h.key).length}
                </span>
              )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={styles.content}>
        {activeTab === "Params" && (
          <KeyValueEditor
            data={tab.params}
            onChange={(params) => updateTab(tab.id, { params })}
            placeholder={{ key: "parameter", value: "value" }}
          />
        )}

        {activeTab === "Headers" && (
          <KeyValueEditor
            data={tab.headers}
            onChange={(headers) => updateTab(tab.id, { headers })}
            placeholder={{ key: "header", value: "value" }}
          />
        )}

        {activeTab === "Body" && (
          <div style={styles.bodyPanel}>
            {/* Body type + preview toggle */}
            <div style={styles.bodyTabs}>
              {BODY_TABS.map((bt) => (
                <button
                  key={bt.value}
                  onClick={() => {
                    updateTab(tab.id, { bodyType: bt.value });
                  }}
                  style={{
                    ...styles.bodyTabBtn,
                    ...(tab.bodyType === bt.value ? styles.bodyTabActive : {}),
                  }}
                >
                  {bt.label}
                </button>
              ))}
            </div>

            {/* Body editor */}
            {tab.bodyType !== "none" && (
              <CodeEditor
                value={tab.body}
                onChange={(body) => updateTab(tab.id, { body })}
                bodyType={tab.bodyType}
              />
            )}

            {tab.bodyType === "none" && (
              <div style={styles.noBody}>No body</div>
            )}
          </div>
        )}

        {activeTab === "Auth" && (
          <AuthPanel
            auth={tab.auth}
            onChange={(auth) => updateTab(tab.id, { auth })}
          />
        )}
      </div>
    </div>
  );
}

// ─── AuthPanel ────────────────────────────────────────────────────────────────

function AuthPanel({
  auth,
  onChange,
}: {
  auth: AuthConfig;
  onChange: (auth: AuthConfig) => void;
}) {
  return (
    <div style={styles.authPanel}>
      <div style={styles.authTypeRow}>
        <span style={styles.authLabel}>Type</span>
        <select
          value={auth.type}
          onChange={(e) => onChange({ type: e.target.value as AuthType })}
          style={styles.select}
        >
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="api-key">API Key</option>
        </select>
      </div>

      {auth.type === "bearer" && (
        <div style={styles.authField}>
          <span style={styles.authLabel}>Token</span>
          <input
            value={auth.token ?? ""}
            onChange={(e) => onChange({ ...auth, token: e.target.value })}
            placeholder="Bearer token..."
            style={styles.authInput}
          />
        </div>
      )}

      {auth.type === "basic" && (
        <>
          <div style={styles.authField}>
            <span style={styles.authLabel}>Username</span>
            <input
              value={auth.username ?? ""}
              onChange={(e) => onChange({ ...auth, username: e.target.value })}
              placeholder="username"
              style={styles.authInput}
            />
          </div>
          <div style={styles.authField}>
            <span style={styles.authLabel}>Password</span>
            <input
              type="password"
              value={auth.password ?? ""}
              onChange={(e) => onChange({ ...auth, password: e.target.value })}
              placeholder="password"
              style={styles.authInput}
            />
          </div>
        </>
      )}

      {auth.type === "api-key" && (
        <>
          <div style={styles.authField}>
            <span style={styles.authLabel}>Key</span>
            <input
              value={auth.apiKey ?? ""}
              onChange={(e) => onChange({ ...auth, apiKey: e.target.value })}
              placeholder="X-API-Key"
              style={styles.authInput}
            />
          </div>
          <div style={styles.authField}>
            <span style={styles.authLabel}>Value</span>
            <input
              value={auth.apiValue ?? ""}
              onChange={(e) => onChange({ ...auth, apiValue: e.target.value })}
              placeholder="api-key-value"
              style={styles.authInput}
            />
          </div>
          <div style={styles.authField}>
            <span style={styles.authLabel}>Add to</span>
            <select
              value={auth.apiKeyIn ?? "header"}
              onChange={(e) =>
                onChange({
                  ...auth,
                  apiKeyIn: e.target.value as "header" | "query",
                })
              }
              style={styles.select}
            >
              <option value="header">Header</option>
              <option value="query">Query Param</option>
            </select>
          </div>
        </>
      )}

      {auth.type === "none" && (
        <div style={styles.noBody}>No authentication</div>
      )}
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
  empty: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "var(--eos-muted)",
    fontSize: 13,
  },
  urlBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderBottom: "1px solid var(--eos-border)",
    flexShrink: 0,
  },
  urlInput: {
    flex: 1,
    background: "var(--eos-surface)",
    border: "1px solid var(--eos-border)",
    borderRadius: "var(--radius)",
    padding: "7px 12px",
    fontSize: 13,
    color: "var(--eos-text)",
    transition: "border-color 0.15s",
  },
  sendBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "var(--eos-accent)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius)",
    padding: "7px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.15s, opacity 0.15s",
  },
  tabsBar: {
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid var(--eos-border)",
    padding: "0 12px",
    flexShrink: 0,
    gap: 4,
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    fontSize: 12,
    color: "var(--eos-muted)",
    background: "none",
    border: "none",
    cursor: "pointer",
    transition: "color 0.1s",
    marginBottom: -1,
    outline: "none",
  },
  tabBtnActive: {
    color: "var(--eos-text)",
    borderBottom: "2px solid var(--eos-accent)",
  },
  badge: {
    background: "var(--eos-accent-dim)",
    color: "var(--eos-accent)",
    borderRadius: 10,
    padding: "1px 6px",
    fontSize: 10,
    fontWeight: 600,
  },
  content: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  bodyPanel: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  bodyTabs: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "8px 12px",
    borderBottom: "1px solid var(--eos-border)",
    flexShrink: 0,
  },
  bodyTabBtn: {
    padding: "3px 10px",
    fontSize: 12,
    color: "var(--eos-muted)",
    background: "none",
    borderRadius: "var(--radius)",
    cursor: "pointer",
    transition: "all 0.1s",
    outline: "none",
  },
  bodyTabActive: {
    color: "var(--eos-text)",
    background: "var(--eos-surface-2)",
    borderColor: "var(--eos-border)",
  },
  bodyTextarea: {
    flex: 1,
    background: "var(--eos-bg)",
    color: "var(--eos-text)",
    border: "none",
    padding: 16,
    fontSize: 13,
    fontFamily: "var(--font-mono)",
    resize: "none",
    lineHeight: 1.6,
  },
  jsonWrapper: {
    flex: 1,
    overflow: "auto",
    padding: 16,
  },
  noBody: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--eos-muted)",
    fontSize: 13,
  },
  authPanel: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  authTypeRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  authField: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  authLabel: {
    fontSize: 12,
    color: "var(--eos-muted)",
    width: 72,
    flexShrink: 0,
  },
  authInput: {
    flex: 1,
    background: "var(--eos-surface)",
    border: "1px solid var(--eos-border)",
    borderRadius: "var(--radius)",
    padding: "6px 10px",
    fontSize: 13,
    color: "var(--eos-text)",
  },
  select: {
    background: "var(--eos-surface)",
    border: "1px solid var(--eos-border)",
    borderRadius: "var(--radius)",
    padding: "6px 10px",
    fontSize: 13,
    color: "var(--eos-text)",
    cursor: "pointer",
  },
} satisfies Record<string, React.CSSProperties>;
