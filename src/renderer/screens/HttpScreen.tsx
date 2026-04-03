import React from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { TabBar } from '@/components/TabBar'
import { RequestPanel } from '@/components/RequestPanel'
import { ResponsePanel } from '@/components/RepsonsePanel'
import { selectActiveTab, useTabsStore } from '@/features/tabs/tabs.store'
import { useSettingsStore } from '@/features/settings/settings.store'
import { EmptyState } from '@/components/EmptyState'
 import { useResizable } from '@/hooks/useResizable'
import { Resizer } from '@/components/ui/Resizer'
import './screens.css'

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
          className="expand-panel-btn expand-panel-btn-left"
          onClick={() => setSidebarVisible(true)}
          title="Show Sidebar"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {sidebarVisible && <Sidebar />}

      <div className="screen-main">
        <TabBar />
        <div className="screen-panels">
          {activeTab ? (
            <>
              <div className="screen-request-panel">
                <RequestPanel />
              </div>
              {responsePanelVisible && (
                <>
                  <Resizer
                    className="response-resizer"
                    onMouseDown={startResizingResponse}
                  />
                  <div
                    className="screen-response-panel"
                    style={{ width: responseWidth, flex: 'none' }}
                  >
                    <ResponsePanel />
                  </div>
                </>
              )}

              {!responsePanelVisible && (
                <button
                  className="expand-panel-btn expand-panel-btn-right"
                  onClick={() => setResponsePanelVisible(true)}
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
