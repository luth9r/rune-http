import { useState, useRef, useEffect } from 'react'
import { Send, File as FileIcon, FolderOpen } from 'lucide-react'
import { useTabsStore, selectActiveTab } from '@/features/tabs/tabs.store'
import { useHttpRequest } from '@/hooks/useHttpRequest'
import { MethodSelect } from './components/MethodSelect'
import { KeyValueEditor } from './components/KeyValueEditor'
import { AuthPanel } from './components/AuthPanel'
import { CodeEditor } from 'renderer/components/shared/CodeEditor'
import { Button } from '@/components/ui/button'
import type { BodyType, KeyValuePair } from '@/types'
import { Select } from '../ui/select'
import { SmartInput } from '../ui/smart-input'
import { formatJson, formatXml } from '@/utils/formatters'
import {
  BODY_OPTIONS,
  REQUEST_TABS,
  type RequestTab,
  getCount,
  parseFormBody,
  serializeFormBody,
  parseUrlParams,
  updateUrlWithParams,
} from './utils/utils'
import { useResizable } from '@/hooks/useResizable'
import { useTranslation } from '@/i18n'
import './request-panel.css'

export function RequestPanel() {
  const { t } = useTranslation()
  const { sendRequest } = useHttpRequest()
  const [activeTab, setActiveTab] = useState<RequestTab>('Body')
  const tab = useTabsStore(selectActiveTab)
  const { updateTab } = useTabsStore()

  const [formData, setFormData] = useState<KeyValuePair[]>(() =>
    tab ? parseFormBody(tab.body, tab.bodyType === 'multipart') : []
  )

  const prevTabId = useRef(tab?.id)
  const prevBodyType = useRef(tab?.bodyType)

  useEffect(() => {
    if (!tab) return
    const tabChanged = prevTabId.current !== tab.id
    const typeChanged = prevBodyType.current !== tab.bodyType
    if (tabChanged || typeChanged) {
      setFormData(parseFormBody(tab.body, tab.bodyType === 'multipart'))
      prevTabId.current = tab.id
      prevBodyType.current = tab.bodyType
    }
  }, [tab?.id, tab?.bodyType])

  if (!tab) return <div className="request-panel__empty">{t('request.no_active_tab') || 'No active tab'}</div>

  const handleFormDataChange = (data: KeyValuePair[]) => {
    setFormData(data)
    updateTab(tab.id, { body: serializeFormBody(data, tab.bodyType) })
  }

  const handleFormatBody = () => {
    if (tab.bodyType === 'json')
      updateTab(tab.id, { body: formatJson(tab.body) })
    if (tab.bodyType === 'xml') updateTab(tab.id, { body: formatXml(tab.body) })
  }

  return (
    <div className="request-panel">
      {/* URL Bar */}
      <div className="request-panel__url-bar">
        <MethodSelect
          onChange={method => updateTab(tab.id, { method })}
          value={tab.method}
        />
        <SmartInput
          className="request-panel-url-input"
          onChange={val => {
            const newParams = parseUrlParams(val)
            updateTab(tab.id, { url: val, params: newParams })
          }}
          placeholder={t('request.url_placeholder')}
          value={tab.url}
        />
        <Button
          className="request-panel__send-btn"
          disabled={tab.isLoading || !tab.url}
          onClick={() => sendRequest(tab.id)}
          variant="primary"
        >
          {tab.isLoading ? (
            <div className="spinner" />
          ) : (
            <>
              <Send size={14} />
              <span>{t('request.send')}</span>
            </>
          )}
        </Button>
      </div>

      {/* Tab bar */}
      <div className="request-panel__tabs-bar">
        {REQUEST_TABS.map(tabName => (
          <button
            className={`request-panel__tab-btn${activeTab === tabName ? ' active' : ''}`}
            key={tabName}
            onClick={() => setActiveTab(tabName)}
          >
            {t(`request.${tabName.toLowerCase()}` as any)}
            {tabName === 'Params' && getCount(tab.params) > 0 && (
              <span className="request-panel__badge">
                {getCount(tab.params)}
              </span>
            )}
            {tabName === 'Headers' && getCount(tab.headers) > 0 && (
              <span className="request-panel__badge">
                {getCount(tab.headers)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="request-panel__content">
        {activeTab === 'Params' && (
          <KeyValueEditor
            data={tab.params}
            onChange={params => {
              const newUrl = updateUrlWithParams(tab.url, params)
              updateTab(tab.id, { params, url: newUrl })
            }}
            placeholder={{ key: 'parameter', value: 'value' }}
          />
        )}

        {activeTab === 'Headers' && (
          <KeyValueEditor
            data={tab.headers}
            onChange={headers => updateTab(tab.id, { headers })}
            placeholder={{ key: 'header', value: 'value' }}
          />
        )}

        {activeTab === 'Body' && (
          <div className="body-panel">
            <div className="panel-header">
              <div className="panel-selector">
                <span className="panel-label">{t('request.content_type')}</span>
                <Select
                  onChange={val =>
                    updateTab(tab.id, { bodyType: val as BodyType })
                  }
                  options={BODY_OPTIONS}
                  value={tab.bodyType}
                />
              </div>
              {['json', 'xml'].includes(tab.bodyType) && (
                <Button
                  className="format-btn"
                  onClick={handleFormatBody}
                  size="xs"
                  variant="ghost"
                >
                  {t('request.prettify')}
                </Button>
              )}
            </div>

            <div className="body-panel__content">
              {tab.bodyType === 'none' && (
                <div className="panel-empty">
                  <p>{t('request.no_body')}</p>
                </div>
              )}

              {(tab.bodyType === 'urlencoded' ||
                tab.bodyType === 'multipart') && (
                <div className="request-panel__form-editor">
                  <KeyValueEditor
                    allowFileSelection={tab.bodyType === 'multipart'}
                    data={formData}
                    onChange={handleFormDataChange}
                    placeholder={{ key: 'field', value: 'value' }}
                  />
                </div>
              )}

              {tab.bodyType === 'binary' && (
                <div className="body-panel__binary">
                  <div className="binary-info">
                    <FileIcon className="binary-icon" size={24} />
                    <div className="binary-details">
                      <span className="binary-filename">
                        {tab.body
                          ? tab.body.split(/[/\\]/).pop()
                          : t('request.no_file_selected')}
                      </span>
                      <span className="binary-path">
                        {tab.body || t('request.file_body_desc')}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        const path = await (
                          window as any
                        ).api.utils.selectFile()
                        if (path) {
                          updateTab(tab.id, { body: path })
                        }
                      } catch (err) {
                        console.error('Failed to select file', err)
                      }
                    }}
                    variant="secondary"
                  >
                    <FolderOpen className="mr-2" size={14} />
                    {tab.body ? t('request.change_file') : t('request.select_file')}
                  </Button>
                </div>
              )}

              {['json', 'xml', 'text'].includes(tab.bodyType) && (
                <CodeEditor
                  bodyType={tab.bodyType as any}
                  onChange={body => updateTab(tab.id, { body })}
                  value={tab.body}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'Auth' && (
          <AuthPanel
            auth={tab.auth}
            onChange={auth => updateTab(tab.id, { auth })}
          />
        )}
      </div>
    </div>
  )
}
