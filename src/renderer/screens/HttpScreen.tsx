import { Sidebar } from '@/components/Sidebar'
import { TabBar } from '@/components/TabBar'
import { RequestPanel } from '@/components/RequestPanel'
import { ResponsePanel } from '@/features/request/ResponsePanel'
import { selectActiveTab, useTabsStore } from '@/features/tabs/tabs.store'
import { EmptyState } from '@/components/EmptyState'

export function HttpScreen() {
  const activeTab = useTabsStore(selectActiveTab)

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
              <div style={styles.responsePanel}>
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
  },
  responsePanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
} as const
