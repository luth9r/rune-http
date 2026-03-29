import { useState, useRef, useEffect } from "react";
import { Send, File as FileIcon, FolderOpen } from "lucide-react";
import { useTabsStore, selectActiveTab } from "@/features/tabs/tabs.store";
import { useHttpRequest } from "@/hooks/useHttpRequest";
import { MethodSelect } from "./components/MethodSelect";
import { KeyValueEditor } from "./components/KeyValueEditor";
import { AuthPanel } from "./components/AuthPanel";
import { CodeEditor } from "renderer/components/shared/CodeEditor";
import { Button } from "@/components/ui/button";
import type { BodyType, KeyValuePair } from "@/types";
import { Select } from "../ui/select";
import { SmartInput } from "../ui/smart-input";
import { formatJson, formatXml } from "@/utils/formatters";
import {
  BODY_OPTIONS,
  REQUEST_TABS,
  type RequestTab,
  getCount,
  parseFormBody,
  serializeFormBody,
} from "./utils/utils";
import "./request-panel.css";

export function RequestPanel() {
  const { sendRequest } = useHttpRequest();
  const [activeTab, setActiveTab] = useState<RequestTab>("Body");
  const tab = useTabsStore(selectActiveTab);
  const { updateTab } = useTabsStore();

  const [formData, setFormData] = useState<KeyValuePair[]>(() =>
    tab ? parseFormBody(tab.body, tab.bodyType === "multipart") : [],
  );

  const prevTabId = useRef(tab?.id);
  const prevBodyType = useRef(tab?.bodyType);

  useEffect(() => {
    if (!tab) return;
    const tabChanged = prevTabId.current !== tab.id;
    const typeChanged = prevBodyType.current !== tab.bodyType;
    if (tabChanged || typeChanged) {
      setFormData(parseFormBody(tab.body, tab.bodyType === "multipart"));
      prevTabId.current = tab.id;
      prevBodyType.current = tab.bodyType;
    }
  }, [tab?.id, tab?.bodyType]);

  if (!tab) return <div className="request-panel__empty">No active tab</div>;

  const handleFormDataChange = (data: KeyValuePair[]) => {
    setFormData(data);
    updateTab(tab.id, { body: serializeFormBody(data, tab.bodyType) });
  };

  const handleFormatBody = () => {
    if (tab.bodyType === "json")
      updateTab(tab.id, { body: formatJson(tab.body) });
    if (tab.bodyType === "xml")
      updateTab(tab.id, { body: formatXml(tab.body) });
  };

  return (
    <div className="request-panel">
      {/* URL Bar */}
      <div className="request-panel__url-bar">
        <MethodSelect
          value={tab.method}
          onChange={(method) => updateTab(tab.id, { method })}
        />
        <SmartInput
          className="request-panel-url-input"
          value={tab.url}
          placeholder="http://localhost:3000/api"
          onChange={(val) => updateTab(tab.id, { url: val })}
        />
        <Button
          variant="primary"
          disabled={tab.isLoading || !tab.url}
          onClick={() => sendRequest(tab.id)}
          className="request-panel__send-btn"
        >
          {tab.isLoading ? (
            <div className="spinner" />
          ) : (
            <>
              <Send size={14} />
              <span>Send</span>
            </>
          )}
        </Button>
      </div>

      {/* Tab bar */}
      <div className="request-panel__tabs-bar">
        {REQUEST_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`request-panel__tab-btn${activeTab === t ? " active" : ""}`}
          >
            {t}
            {t === "Params" && getCount(tab.params) > 0 && (
              <span className="request-panel__badge">
                {getCount(tab.params)}
              </span>
            )}
            {t === "Headers" && getCount(tab.headers) > 0 && (
              <span className="request-panel__badge">
                {getCount(tab.headers)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="request-panel__content">
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
          <div className="body-panel">
            <div className="panel-header">
              <div className="panel-selector">
                <span className="panel-label">Content Type</span>
                <Select
                  value={tab.bodyType}
                  onChange={(val) =>
                    updateTab(tab.id, { bodyType: val as BodyType })
                  }
                  options={BODY_OPTIONS}
                />
              </div>
              {["json", "xml"].includes(tab.bodyType) && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleFormatBody}
                  className="format-btn"
                >
                  Prettify
                </Button>
              )}
            </div>

            <div className="body-panel__content">
              {tab.bodyType === "none" && (
                <div className="panel-empty">
                  <p>This request does not have a body</p>
                </div>
              )}

              {(tab.bodyType === "urlencoded" ||
                tab.bodyType === "multipart") && (
                <div className="request-panel__form-editor">
                  <KeyValueEditor
                    data={formData}
                    onChange={handleFormDataChange}
                    allowFileSelection={tab.bodyType === "multipart"}
                    placeholder={{ key: "field", value: "value" }}
                  />
                </div>
              )}

              {tab.bodyType === "binary" && (
                <div className="body-panel__binary">
                  <div className="binary-info">
                    <FileIcon size={24} className="binary-icon" />
                    <div className="binary-details">
                      <span className="binary-filename">
                        {tab.body ? tab.body.split(/[/\\]/).pop() : "No file selected"}
                      </span>
                      <span className="binary-path">
                        {tab.body || "Please select a file to send as body"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        const path = await (window as any).api.utils.selectFile();
                        if (path) {
                          updateTab(tab.id, { body: path });
                        }
                      } catch (err) {
                        console.error("Failed to select file", err);
                      }
                    }}
                  >
                    <FolderOpen size={14} className="mr-2" />
                    {tab.body ? "Change File" : "Select File"}
                  </Button>
                </div>
              )}

              {["json", "xml", "text"].includes(tab.bodyType) && (
                <CodeEditor
                  bodyType={tab.bodyType as any}
                  value={tab.body}
                  onChange={(body) => updateTab(tab.id, { body })}
                />
              )}
            </div>
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
