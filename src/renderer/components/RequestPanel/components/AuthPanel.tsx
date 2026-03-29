import type { AuthConfig, AuthType } from "@/types";
import { Select } from "@/components/ui/select";
import { SmartInput } from "@/components/ui/smart-input";

export function AuthPanel({
  auth,
  onChange,
}: {
  auth: AuthConfig;
  onChange: (auth: AuthConfig) => void;
}) {
  return (
    <div className="auth-panel">
      <div className="panel-header">
        <div className="panel-selector">
          <span className="panel-label">Auth Type</span>
          <Select
            value={auth.type}
            onChange={(type) => onChange({ type: type as AuthType })}
            options={[
              { label: "No Auth", value: "none" },
              { label: "Bearer Token", value: "bearer" },
              { label: "Basic Auth", value: "basic" },
              { label: "API Key", value: "api-key" },
            ]}
          />
        </div>
      </div>

      <div className="auth-panel__content">
        {auth.type === "bearer" && (
          <div className="auth-panel__field">
            <span className="auth-panel__label">Token</span>
            <SmartInput
              value={auth.token ?? ""}
              onChange={(v) => onChange({ ...auth, token: v })}
              type="password"
              placeholder="Bearer token..."
            />
          </div>
        )}

        {auth.type === "basic" && (
          <>
            <div className="auth-panel__field">
              <span className="auth-panel__label">Username</span>
              <SmartInput
                value={auth.username ?? ""}
                onChange={(v) => onChange({ ...auth, username: v })}
                placeholder="username"
              />
            </div>
            <div className="auth-panel__field">
              <span className="auth-panel__label">Password</span>
              <SmartInput
                type="password"
                value={auth.password ?? ""}
                onChange={(v) => onChange({ ...auth, password: v })}
                placeholder="password"
              />
            </div>
          </>
        )}

        {auth.type === "api-key" && (
          <>
            <div className="auth-panel__field">
              <span className="auth-panel__label">Key</span>
              <SmartInput
                value={auth.apiKey ?? ""}
                onChange={(v) => onChange({ ...auth, apiKey: v })}
                placeholder="X-API-Key"
              />
            </div>
            <div className="auth-panel__field">
              <span className="auth-panel__label">Value</span>
              <SmartInput
                value={auth.apiValue ?? ""}
                type="password"
                onChange={(v) => onChange({ ...auth, apiValue: v })}
                placeholder="api-key-value"
              />
            </div>
            <div className="auth-panel__field">
              <span className="auth-panel__label">Add to</span>
              <Select
                value={auth.apiKeyIn ?? "header"}
                onChange={(v) =>
                  onChange({ ...auth, apiKeyIn: v as "header" | "query" })
                }
                options={[
                  { label: "Header", value: "header" },
                  { label: "Query Param", value: "query" },
                ]}
              />
            </div>
          </>
        )}

        {auth.type === "none" && (
          <div className="panel-empty">
            <p>This request does not use authentication</p>
          </div>
        )}
      </div>
    </div>
  );
}
