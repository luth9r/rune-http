import { Sidebar } from '@/components/Sidebar'
import { TabBar } from '@/components/TabBar'
import { RequestPanel } from '@/components/RequestPanel'
import { ResponsePanel } from '@/features/request/ResponsePanel'
import { selectActiveTab, useTabsStore } from '@/features/tabs/tabs.store'
import { EmptyState } from '@/components/EmptyState'
import { useResizable } from '@/hooks/useResizable'
import { Resizer } from '@/components/ui/Resizer'
import React from 'react'

export function HttpScreen() {
  const activeTab = useTabsStore(selectActiveTab)

  const {
    size: responseWidth,
    startResizing: startResizingResponse,
  } = useResizable({
    persistenceKey: 'rune-response-panel-width',
    initialSize: 500,
    minSize: 300,
    maxSize: 800,
    reverse: true, // Handle is on the left of the panel
  })

  return (
    <>
      <Sidebar />
      <div style={styles.main}>
        <TabBar />
        <div style={styles.panels}>
          {activeTab ? (
            <>
              <div style={styles.requestPanel}>
                <RequestPanel />
              </div>
              <Resizer
                onMouseDown={startResizingResponse}
                className="response-resizer"
              />
              <div style={{ ...styles.responsePanel, width: responseWidth, flex: 'none' }}>
                <ResponsePanel />
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </>
  )
}

const styles = {
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  panels: { flex: 1, display: 'flex', overflow: 'hidden' },
  requestPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--eos-border)',
    overflow: 'hidden',
    minWidth: 300,
  },
  responsePanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
} as const
