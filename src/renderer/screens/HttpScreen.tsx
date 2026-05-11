import React from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { TabBar } from '@/components/TabBar'
import { RequestPanel } from '@/components/RequestPanel'
import { ResponsePanel } from '@/components/ResponsePanel'
import { selectActiveTab, useTabsStore } from '@/features/tabs/tabs.store'
import { useSettingsStore } from '@/features/settings/settings.store'
import { EmptyState } from '@/components/EmptyState'
import { useResizable } from '@/hooks/useResizable'
import { Resizer } from '@/components/ui/Resizer'

export function HttpScreen() {
  const activeTab = useTabsStore(selectActiveTab)
  const {
    sidebarVisible,
    responsePanelVisible,
    setSidebarVisible,
    setResponsePanelVisible,
  } = useSettingsStore()

  const { size: responseWidth, startResizing: startResizingResponse } =
    useResizable({
      persistenceKey: 'rune-response-panel-width',
      initialSize: 500,
      minSize: 300,
      maxSize: 800,
      reverse: true, // Handle is on the left of the panel
      silent: true,
    })

  return (
    <>
      {!sidebarVisible && (
        <button
          onClick={() => setSidebarVisible(true)}
          style={{
            ...s.expandPanelBtn,
            ...s.expandPanelBtnLeft,
          }}
          title="Show Sidebar"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {sidebarVisible && <Sidebar />}

      <div style={s.screenMain}>
        <TabBar />
        <div style={s.screenPanels}>
          {activeTab ? (
            <>
              <div style={s.screenRequestPanel}>
                <RequestPanel />
              </div>
              {responsePanelVisible && (
                <>
                  <Resizer
                    className="response-resizer"
                    onMouseDown={startResizingResponse}
                  />
                  <div
                    style={{ ...s.screenResponsePanel, width: responseWidth, flex: 'none' }}
                  >
                    <ResponsePanel />
                  </div>
                </>
              )}

              {!responsePanelVisible && (
                <button
                  onClick={() => setResponsePanelVisible(true)}
                  style={{
                    ...s.expandPanelBtn,
                    ...s.expandPanelBtnRight,
                  }}
                  title="Show Response Panel"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </>
  )
}

const s: Record<string, React.CSSProperties> = {
  screenMain: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  screenPanels: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  screenRequestPanel: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    minWidth: '300px',
    overflow: 'hidden',
    borderRight: '1px solid var(--eos-border)',
  },
  screenResponsePanel: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  expandPanelBtn: {
    position: 'absolute',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    color: 'var(--white)',
    background: 'var(--eos-accent)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    boxShadow: '0 4px 12px var(--black-40)',
    opacity: 0.6,
    transition: 'all 0.2s ease',
  },
  expandPanelBtnLeft: {
    top: '50%',
    left: '8px',
    transform: 'translateY(-50%)',
  },
  expandPanelBtnRight: {
    top: '50%',
    right: '8px',
    transform: 'translateY(-50%)',
  },
}
