import { describe, it, expect, beforeEach } from 'vitest'
import { useCollectionsStore } from './collections.store'

beforeEach(() => {
  useCollectionsStore.setState({ collections: [] })
})

describe('collections store', () => {
  it('adds a collection', () => {
    useCollectionsStore.getState().addCollection('My API')
    const { collections } = useCollectionsStore.getState()
    expect(collections).toHaveLength(1)
    expect(collections[0].name).toBe('My API')
  })

  it('removes a collection', () => {
    useCollectionsStore.getState().addCollection('To Delete')
    const { collections } = useCollectionsStore.getState()
    useCollectionsStore.getState().removeCollection(collections[0].id)
    expect(useCollectionsStore.getState().collections).toHaveLength(0)
  })

  it('adds a request to a collection', () => {
    useCollectionsStore.getState().addCollection('API')
    const col = useCollectionsStore.getState().collections[0]
    useCollectionsStore.getState().addRequest(col.id, {
      name: 'Get Users',
      method: 'GET',
      url: '/users',
      headers: [],
      params: [],
      body: '',
      bodyType: 'none',
      auth: { type: 'none' },
    })
    const items = useCollectionsStore.getState().collections[0].items
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Get Users')
  })

  it('renames a collection', () => {
    useCollectionsStore.getState().addCollection('Old Name')
    const col = useCollectionsStore.getState().collections[0]
    useCollectionsStore.getState().renameCollection(col.id, 'New Name')
    expect(useCollectionsStore.getState().collections[0].name).toBe('New Name')
  })

  it('toggles a collection', () => {
    useCollectionsStore.getState().addCollection('Toggle')
    const col = useCollectionsStore.getState().collections[0]
    const initialState = col.isOpen
    useCollectionsStore.getState().toggleCollection(col.id)
    expect(useCollectionsStore.getState().collections[0].isOpen).toBe(!initialState)
  })

  it('renames an item', () => {
    useCollectionsStore.getState().addCollection('API')
    const col = useCollectionsStore.getState().collections[0]
    const requestId = useCollectionsStore.getState().addRequest(col.id, {
      name: 'Old Req',
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body: '',
      bodyType: 'none',
      auth: { type: 'none' },
    })
    useCollectionsStore.getState().renameItem(col.id, requestId, 'New Req')
    const item = useCollectionsStore.getState().collections[0].items[0]
    expect(item.name).toBe('New Req')
    expect(item.request?.name).toBe('New Req')
  })

  it('removes an item', () => {
    useCollectionsStore.getState().addCollection('API')
    const col = useCollectionsStore.getState().collections[0]
    const requestId = useCollectionsStore.getState().addRequest(col.id, {
      name: 'Req',
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body: '',
      bodyType: 'none',
      auth: { type: 'none' },
    })
    useCollectionsStore.getState().removeItem(col.id, requestId)
    expect(useCollectionsStore.getState().collections[0].items).toHaveLength(0)
  })

  it('duplicates a collection', () => {
    useCollectionsStore.getState().addCollection('Original')
    const col = useCollectionsStore.getState().collections[0]
    useCollectionsStore.getState().duplicateCollection(col.id)
    const { collections } = useCollectionsStore.getState()
    expect(collections).toHaveLength(2)
    expect(collections[1].name).toBe('Original Copy')
    expect(collections[1].id).not.toBe(col.id)
  })

  it('duplicates a collection with items that have no request', () => {
    useCollectionsStore.getState().addCollection('Folder Col')
    const colId = useCollectionsStore.getState().collections[0].id
    // Manually add a folder-like item
    useCollectionsStore.setState(state => {
      state.collections[0].items.push({ id: 'f1', name: 'Folder', type: 'folder' } as any)
    })
    
    useCollectionsStore.getState().duplicateCollection(colId)
    const { collections } = useCollectionsStore.getState()
    expect(collections).toHaveLength(2)
    expect(collections[1].items[0].name).toBe('Folder')
    expect(collections[1].items[0].request).toBeUndefined()
  })

  it('duplicates a request', () => {
    useCollectionsStore.getState().addCollection('API')
    const col = useCollectionsStore.getState().collections[0]
    const requestId = useCollectionsStore.getState().addRequest(col.id, {
      name: 'Original Req',
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body: '',
      bodyType: 'none',
      auth: { type: 'none' },
    })
    useCollectionsStore.getState().duplicateRequest(col.id, requestId)
    const { items } = useCollectionsStore.getState().collections[0]
    expect(items).toHaveLength(2)
    expect(items[1].name).toBe('Original Req Copy')
    expect(items[1].id).not.toBe(requestId)
  })

  it('imports into collection', () => {
    useCollectionsStore.getState().addCollection('API')
    const colId = useCollectionsStore.getState().collections[0].id
    const items: any[] = [{ id: 'i1', name: 'Imported', type: 'request' }]
    useCollectionsStore.getState().importIntoCollection(colId, items)
    expect(useCollectionsStore.getState().collections[0].items).toHaveLength(1)
    expect(useCollectionsStore.getState().collections[0].items[0].name).toBe('Imported')
  })

  it('updates a request', () => {
    useCollectionsStore.getState().addCollection('API')
    const col = useCollectionsStore.getState().collections[0]
    const requestId = useCollectionsStore.getState().addRequest(col.id, {
      name: 'Req',
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body: '',
      bodyType: 'none',
      auth: { type: 'none' },
    })
    useCollectionsStore.getState().updateRequest(col.id, requestId, { method: 'POST', url: '/new' })
    const item = useCollectionsStore.getState().collections[0].items[0]
    expect(item.request?.method).toBe('POST')
    expect(item.request?.url).toBe('/new')
  })

  describe('moveItem', () => {
    it('moves a collection before another', () => {
      useCollectionsStore.getState().addCollection('Col 1')
      useCollectionsStore.getState().addCollection('Col 2')
      const { collections } = useCollectionsStore.getState()
      const id1 = collections[0].id
      const id2 = collections[1].id
      
      useCollectionsStore.getState().moveItem(id2, id1, 'before')
      const newCols = useCollectionsStore.getState().collections
      expect(newCols[0].id).toBe(id2)
      expect(newCols[1].id).toBe(id1)
    })

    it('moves an item between collections', () => {
      useCollectionsStore.getState().addCollection('Col 1')
      useCollectionsStore.getState().addCollection('Col 2')
      const { collections } = useCollectionsStore.getState()
      const col1Id = collections[0].id
      const col2Id = collections[1].id
      const reqId = useCollectionsStore.getState().addRequest(col1Id, {
        name: 'Req',
        method: 'GET',
        url: '',
        headers: [],
        params: [],
        body: '',
        bodyType: 'none',
        auth: { type: 'none' },
      })
      
      useCollectionsStore.getState().moveItem(reqId, col2Id, 'after')
      expect(useCollectionsStore.getState().collections[0].items).toHaveLength(0)
      expect(useCollectionsStore.getState().collections[1].items).toHaveLength(1)
      expect(useCollectionsStore.getState().collections[1].items[0].id).toBe(reqId)
    })
  })
})
