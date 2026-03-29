import { describe, it, expect, beforeEach } from 'vitest'
import { useTabsStore } from './tabs.store'

beforeEach(() => {
  useTabsStore.setState({ tabs: [], activeTabId: null })
})

describe('tabs store', () => {
  it('opens a new tab and sets it active', () => {
    useTabsStore.getState().openTab({ name: 'Test' })
    const { tabs, activeTabId } = useTabsStore.getState()
    expect(tabs).toHaveLength(1)
    expect(tabs[0].name).toBe('Test')
    expect(activeTabId).toBe(tabs[0].id)
  })

  it('closes a tab and switches to nearest', () => {
    useTabsStore.getState().openTab({ name: 'Tab 1' })
    useTabsStore.getState().openTab({ name: 'Tab 2' })
    const { tabs } = useTabsStore.getState()
    useTabsStore.getState().closeTab(tabs[1].id)
    expect(useTabsStore.getState().tabs).toHaveLength(1)
    expect(useTabsStore.getState().activeTabId).toBe(tabs[0].id)
  })

  it('always keeps at least one tab', () => {
    useTabsStore.getState().openTab()
    const { tabs } = useTabsStore.getState()
    useTabsStore.getState().closeTab(tabs[0].id)
    expect(useTabsStore.getState().tabs).toHaveLength(1)
  })

  it('updates tab fields and marks as dirty', () => {
    useTabsStore.getState().openTab()
    const { tabs } = useTabsStore.getState()
    useTabsStore.getState().updateTab(tabs[0].id, { url: 'http://localhost' })
    const updated = useTabsStore.getState().tabs[0]
    expect(updated.url).toBe('http://localhost')
    expect(updated.isDirty).toBe(true)
  })

  it('sets response and stops loading', () => {
    useTabsStore.getState().openTab()
    const { tabs } = useTabsStore.getState()
    useTabsStore.getState().setTabLoading(tabs[0].id, true)
    useTabsStore.getState().setTabResponse(tabs[0].id, {
      status: 200,
      statusText: 'OK',
      headers: {},
      body: '{}',
      size: 2,
      duration: 50,
      timestamp: Date.now(),
    })
    const tab = useTabsStore.getState().tabs[0]
    expect(tab.isLoading).toBe(false)
    expect(tab.response?.status).toBe(200)
  })

  it('marks tab as clean', () => {
    useTabsStore.getState().openTab()
    const { tabs } = useTabsStore.getState()
    useTabsStore.getState().updateTab(tabs[0].id, { url: 'http://test' })
    useTabsStore.getState().markClean(tabs[0].id)
    expect(useTabsStore.getState().tabs[0].isDirty).toBe(false)
  })
})
