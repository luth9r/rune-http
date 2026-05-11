import { describe, it, expect, beforeEach, vi } from 'vitest'
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

  it('reorders tabs', () => {
    useTabsStore.getState().openTab({ name: 'Tab 1' })
    useTabsStore.getState().openTab({ name: 'Tab 2' })
    const { tabs } = useTabsStore.getState()
    const id1 = tabs[0].id
    const id2 = tabs[1].id
    
    useTabsStore.getState().reorderTabs(id1, id2)
    const newTabs = useTabsStore.getState().tabs
    expect(newTabs[0].id).toBe(id2)
    expect(newTabs[1].id).toBe(id1)
  })

  it('switches body content when bodyType changes', () => {
    useTabsStore.getState().openTab()
    const { tabs } = useTabsStore.getState()
    const id = tabs[0].id
    
    // Set JSON body
    useTabsStore.getState().updateTab(id, { bodyType: 'json', body: '{"a":1}' })
    expect(useTabsStore.getState().tabs[0].bodies.json).toBe('{"a":1}')
    
    // Switch to XML
    useTabsStore.getState().updateTab(id, { bodyType: 'xml', body: '<root></root>' })
    expect(useTabsStore.getState().tabs[0].bodies.xml).toBe('<root></root>')
    expect(useTabsStore.getState().tabs[0].bodies.json).toBe('{"a":1}')
    
    // Switch back to JSON
    useTabsStore.getState().updateTab(id, { bodyType: 'json' })
    expect(useTabsStore.getState().tabs[0].body).toBe('{"a":1}')
  })

  it('sets save modal open state', () => {
    useTabsStore.getState().setSaveModalOpen(true)
    expect(useTabsStore.getState().isSaveModalOpen).toBe(true)
  })

  it('updates tab by requestId', () => {
    useTabsStore.getState().openTab({ requestId: 'req-1', name: 'Old' })
    useTabsStore.getState().updateTabByRequestId('req-1', { name: 'New' })
    expect(useTabsStore.getState().tabs[0].name).toBe('New')
  })

  it('saves tab calling updateRequestFn', () => {
    const updateRequestFn = vi.fn()
    useTabsStore.getState().openTab({ 
      requestId: 'req-1', 
      collectionId: 'col-1', 
      name: 'My Req',
      method: 'GET'
    })
    const id = useTabsStore.getState().tabs[0].id
    
    // Make it dirty
    useTabsStore.getState().updateTab(id, { url: 'http://new' })
    
    useTabsStore.getState().saveTab(id, updateRequestFn)
    
    expect(updateRequestFn).toHaveBeenCalledWith('col-1', 'req-1', expect.objectContaining({
      url: 'http://new',
      method: 'GET'
    }))
    expect(useTabsStore.getState().tabs[0].isDirty).toBe(false)
  })

  it('formats JSON body on save', () => {
    const updateRequestFn = vi.fn()
    useTabsStore.getState().openTab({ 
      requestId: 'req-1', 
      collectionId: 'col-1', 
      bodyType: 'json',
      body: '{"a":1}'
    })
    const id = useTabsStore.getState().tabs[0].id
    
    // Update body to make it dirty
    useTabsStore.getState().updateTab(id, { body: '{"a": 2}' })
    
    useTabsStore.getState().saveTab(id, updateRequestFn)
    
    expect(updateRequestFn).toHaveBeenCalledWith('col-1', 'req-1', expect.objectContaining({
      body: '{\n  "a": 2\n}'
    }))
  })

  it('opens save modal if requestId is missing on save', () => {
    const updateRequestFn = vi.fn()
    useTabsStore.getState().openTab({ name: 'New' })
    const id = useTabsStore.getState().tabs[0].id
    useTabsStore.getState().updateTab(id, { url: 'http://test' })
    
    useTabsStore.getState().saveTab(id, updateRequestFn)
    expect(useTabsStore.getState().isSaveModalOpen).toBe(true)
    expect(updateRequestFn).not.toHaveBeenCalled()
  })
})
