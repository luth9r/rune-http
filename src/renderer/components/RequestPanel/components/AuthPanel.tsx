import type { AuthConfig, AuthType } from '@/types'
import { Select } from '@/components/ui/select'
import { SmartInput } from '@/components/ui/smart-input'
import { useTranslation } from '@/i18n'

export function AuthPanel({
  auth,
  onChange,
}: {
  auth: AuthConfig
  onChange: (auth: AuthConfig) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="auth-panel">
      <div className="panel-header">
        <div className="panel-selector">
          <span className="panel-label">{t('request.auth_type')}</span>
          <Select
            onChange={type => onChange({ type: type as AuthType })}
            options={[
              { label: t('request.no_auth'), value: 'none' },
              { label: t('request.bearer_token'), value: 'bearer' },
              { label: t('request.basic_auth'), value: 'basic' },
              { label: t('request.api_key'), value: 'api-key' },
            ]}
            value={auth.type}
          />
        </div>
      </div>

      <div className="auth-panel__content">
        {auth.type === 'bearer' && (
          <div className="auth-panel__field">
            <span className="auth-panel__label">{t('request.token')}</span>
            <SmartInput
              onChange={v => onChange({ ...auth, token: v })}
              placeholder={`${t('request.bearer_token')}...`}
              type="password"
              value={auth.token ?? ''}
            />
          </div>
        )}

        {auth.type === 'basic' && (
          <>
            <div className="auth-panel__field">
              <span className="auth-panel__label">{t('request.username')}</span>
              <SmartInput
                onChange={v => onChange({ ...auth, username: v })}
                placeholder={t('request.username').toLowerCase()}
                value={auth.username ?? ''}
              />
            </div>
            <div className="auth-panel__field">
              <span className="auth-panel__label">{t('request.password')}</span>
              <SmartInput
                onChange={v => onChange({ ...auth, password: v })}
                placeholder={t('request.password').toLowerCase()}
                type="password"
                value={auth.password ?? ''}
              />
            </div>
          </>
        )}

        {auth.type === 'api-key' && (
          <>
            <div className="auth-panel__field">
              <span className="auth-panel__label">{t('request.key')}</span>
              <SmartInput
                onChange={v => onChange({ ...auth, apiKey: v })}
                placeholder="X-API-Key"
                value={auth.apiKey ?? ''}
              />
            </div>
            <div className="auth-panel__field">
              <span className="auth-panel__label">{t('request.value')}</span>
              <SmartInput
                onChange={v => onChange({ ...auth, apiValue: v })}
                placeholder="api-key-value"
                type="password"
                value={auth.apiValue ?? ''}
              />
            </div>
            <div className="auth-panel__field">
              <span className="auth-panel__label">{t('request.add_to')}</span>
              <Select
                onChange={v =>
                  onChange({ ...auth, apiKeyIn: v as 'header' | 'query' })
                }
                options={[
                  { label: t('request.header'), value: 'header' },
                  { label: t('request.query_param'), value: 'query' },
                ]}
                value={auth.apiKeyIn ?? 'header'}
              />
            </div>
          </>
        )}

        {auth.type === 'none' && (
          <div className="panel-empty">
            <p>{t('request.no_auth_desc')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
