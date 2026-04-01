import { useState, useMemo, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { useTabsStore, selectActiveTab } from '@/features/tabs/tabs.store'
import { JsonViewer } from '@/components/shared/JsonViewer'
import { cn } from '@/lib/utils'
import './response-panel.css'

const RESPONSE_TABS = ['Body', 'Headers'] as const
type ResponseTab = (typeof RESPONSE_TABS)[number]

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'var(--eos-post)'
  if (status >= 300 && status < 400) return 'var(--eos-put)'
  return 'var(--eos-delete)'
}

export function ResponsePanel() {
  const tab = useTabsStore(selectActiveTab)
  const [activeTab, setActiveTab] = useState<ResponseTab>('Body')
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!tab?.response?.body) return
    navigator.clipboard.writeText(tab.response.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [tab?.response?.body])

  const parsedBody = useMemo(() => {
    if (!tab?.response?.body) return null
    try {
      return JSON.parse(tab.response.body)
    } catch {
      return null
    }
  }, [tab?.response?.body])

  if (!tab) return null

  if (tab.isLoading) {
    return (
      <div className="rp-centered">
        <div className="rp-spinner" />
        <span className="rp-hint">Sending request...</span>
      </div>
    )
  }

  if (tab.error || !tab.response) {
    return (
      <div className="rp-centered">
        <span
          className="rp-hint"
          style={tab.error ? { color: 'var(--eos-delete)' } : undefined}
        >
          {tab.error || 'Send a request to see the response'}
        </span>
      </div>
    )
  }

  const { response } = tab

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

      {/* Tabs */}
      <div className="rp-tabs-bar">
        {RESPONSE_TABS.map(t => (
          <button
            className={cn('rp-tab-btn', activeTab === t && 'active')}
            key={t}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rp-content">
        {activeTab === 'Body' && (
          <div className="rp-body-wrapper">
            <button
              className={cn('rp-copy-btn', copied && 'success')}
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <div className="rp-empty">
              {parsedBody ? (
                <JsonViewer src={parsedBody} />
              ) : (
                <pre className="rp-body">{response.body}</pre>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Headers' && (
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
  )
}

export const eosJsonTheme = {
  base00: 'transparent', // Background
  base01: 'var(--eos-surface-2)', // Toolbar
  base02: 'var(--eos-border)', // Borders
  base03: 'var(--eos-muted)', // Item counts
  base04: 'var(--eos-muted-2)', // Double quotes
  base05: 'var(--eos-text)', // Default text
  base06: 'var(--eos-text)',
  base07: 'var(--eos-accent)', // Keys
  base08: 'var(--eos-delete)', // Error
  base09: 'var(--eos-get)', // Numbers
  base0A: 'var(--eos-put)', // Booleans
  base0B: 'var(--eos-post)', // Strings
  base0C: 'var(--eos-head)', // Regex
  base0D: 'var(--eos-accent-h)', // Expand/Collapse arrows
  base0E: 'var(--eos-patch)', // Functions
  base0F: 'var(--eos-options)', // Null
}
