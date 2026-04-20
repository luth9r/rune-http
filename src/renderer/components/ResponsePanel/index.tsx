import { useState, useMemo, useCallback } from "react";
import { Copy, Check, Zap } from "lucide-react";
import { useTabsStore, selectActiveTab } from "@/features/tabs/tabs.store";
import { JsonViewer } from "@/components/shared/JsonViewer";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import "./response-panel.css";

const RESPONSE_TABS = ["Body", "Headers"] as const;
type ResponseTab = (typeof RESPONSE_TABS)[number];

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return "var(--eos-post)";
  if (status >= 300 && status < 400) return "var(--eos-put)";
  return "var(--eos-delete)";
}

export function ResponsePanel() {
  const { t } = useTranslation();
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
      <div className="rp-centered">
        <div className="rp-spinner" />
        <span className="rp-hint">{t("response.sending")}</span>
      </div>
    );
  }

  const translateError = (err: string) => {
    if (!err) return null;
    if (err.includes("Failed to parse URL")) return t("errors.invalid_url");
    if (err.includes("Invalid")) return t("errors.invalid_url");
    if (err.includes("fetch failed")) return t("errors.network_error");
    if (err.includes("ECONNREFUSED")) return t("errors.connection_refused");
    if (err.includes("ETIMEDOUT") || err.includes("timeout"))
      return t("errors.timeout");
    if (err.includes("ENOTFOUND")) return t("errors.dns_not_found");
    return err;
  };

  if (tab.error || !tab.response) {
    return (
      <div className="rp-empty-state">
        <div className="rp-empty-icon-wrap">
          <Zap
            size={48}
            className={cn("rp-empty-icon", tab.error && "error")}
          />
        </div>
        <h3 className="rp-empty-title">
          {tab.error ? t("common.error") : t("response.empty_title")}
        </h3>
        <p className="rp-empty-desc">
          {tab.error ? translateError(tab.error) : t("response.empty_hint")}
        </p>
      </div>
    );
  }

  const { response } = tab;

  return (
    <div className="rp-root">
      {/* Status bar */}
      <div className="rp-status-bar">
        <span
          className="rp-status-badge"
          style={{
            color: getStatusColor(response.status),
            borderColor: getStatusColor(response.status),
          }}
        >
          {response.status} {response.statusText}
        </span>
        <span className="rp-meta">{response.duration} ms</span>
        <span className="rp-meta-divider">·</span>
        <span className="rp-meta">{response.size} B</span>
      </div>

      <div className="rp-tabs-bar">
        {RESPONSE_TABS.map((t_name) => (
          <button
            className={cn("rp-tab-btn", activeTab === t_name && "active")}
            key={t_name}
            onClick={() => setActiveTab(t_name)}
          >
            {t(`response.${t_name.toLowerCase()}` as any)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rp-content">
        {activeTab === "Body" && (
          <div className="rp-body-wrapper">
            <button
              className={cn("rp-copy-btn", copied && "success")}
              onClick={handleCopy}
              title={t("response.copy")}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <div className="rp-body-content">
              {parsedBody ? (
                <JsonViewer src={parsedBody} />
              ) : (
                <pre className="rp-body">{response.body}</pre>
              )}
            </div>
          </div>
        )}

        {activeTab === "Headers" && (
          <div className="rp-headers-table">
            {Object.entries(response.headers).map(([key, value]) => (
              <div className="rp-header-row" key={key}>
                <span className="rp-header-key">{key}</span>
                <span className="rp-header-value">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const eosJsonTheme = {
  base00: "transparent",
  base01: "var(--eos-surface-2)",
  base02: "var(--eos-border)",
  base03: "var(--eos-muted)",
  base04: "var(--eos-muted-2)",
  base05: "var(--eos-text)",
  base06: "var(--eos-text)",
  base07: "var(--eos-accent)",
  base08: "var(--eos-delete)",
  base09: "var(--eos-get)",
  base0A: "var(--eos-put)",
  base0B: "var(--eos-post)",
  base0C: "var(--eos-head)",
  base0D: "var(--eos-accent-h)",
  base0E: "var(--eos-patch)",
  base0F: "var(--eos-options)",
};
