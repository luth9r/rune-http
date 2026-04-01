import type { AuthConfig, AuthType } from '@/types'
import { Select } from '@/components/ui/select'
import { SmartInput } from '@/components/ui/smart-input'

export function AuthPanel({
  auth,
  onChange,
}: {
  auth: AuthConfig
  onChange: (auth: AuthConfig) => void
}) {
  return (
    <div className="auth-panel">
      <div className="panel-header">
        <div className="panel-selector">
          <span className="panel-label">Auth Type</span>
          <Select
            onChange={type => onChange({ type: type as AuthType })}
            options={[
              { label: 'No Auth', value: 'none' },
              { label: 'Bearer Token', value: 'bearer' },
              { label: 'Basic Auth', value: 'basic' },
              { label: 'API Key', value: 'api-key' },
            ]}
            value={auth.type}
          />
        </div>
      </div>

      <div className="auth-panel__content">
        {auth.type === 'bearer' && (
          <div className="auth-panel__field">
            <span className="auth-panel__label">Token</span>
            <SmartInput
              onChange={v => onChange({ ...auth, token: v })}
              placeholder="Bearer token..."
              type="password"
              value={auth.token ?? ''}
            />
          </div>
        )}

        {auth.type === 'basic' && (
          <>
            <div className="auth-panel__field">
              <span className="auth-panel__label">Username</span>
              <SmartInput
                onChange={v => onChange({ ...auth, username: v })}
                placeholder="username"
                value={auth.username ?? ''}
              />
            </div>
            <div className="auth-panel__field">
              <span className="auth-panel__label">Password</span>
              <SmartInput
                onChange={v => onChange({ ...auth, password: v })}
                placeholder="password"
                type="password"
                value={auth.password ?? ''}
              />
            </div>
          </>
        )}

        {auth.type === 'api-key' && (
          <>
            <div className="auth-panel__field">
              <span className="auth-panel__label">Key</span>
              <SmartInput
                onChange={v => onChange({ ...auth, apiKey: v })}
                placeholder="X-API-Key"
                value={auth.apiKey ?? ''}
              />
            </div>
            <div className="auth-panel__field">
              <span className="auth-panel__label">Value</span>
              <SmartInput
                onChange={v => onChange({ ...auth, apiValue: v })}
                placeholder="api-key-value"
                type="password"
                value={auth.apiValue ?? ''}
              />
            </div>
            <div className="auth-panel__field">
              <span className="auth-panel__label">Add to</span>
              <Select
                onChange={v =>
                  onChange({ ...auth, apiKeyIn: v as 'header' | 'query' })
                }
                options={[
                  { label: 'Header', value: 'header' },
                  { label: 'Query Param', value: 'query' },
                ]}
                value={auth.apiKeyIn ?? 'header'}
              />
            </div>
          </>
        )}

        {auth.type === 'none' && (
          <div className="panel-empty">
            <p>This request does not use authentication</p>
          </div>
        )}
      </div>
    </div>
  )
}
