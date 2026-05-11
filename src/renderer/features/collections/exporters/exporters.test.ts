import { describe, it, expect } from 'vitest'
import { exportCollection } from './index'
import type { Collection } from '@/types'

const mockCollection: Collection = {
  id: 'col-123',
  name: 'Test Collection',
  isOpen: true,
  createdAt: 1000,
  updatedAt: 2000,
  items: [
    {
      id: 'req-1',
      type: 'request',
      name: 'Get Data',
      request: {
        id: 'req-1',
        name: 'Get Data',
        method: 'GET',
        url: 'https://api.example.com',
        headers: [{ id: 'h1', key: 'Content-Type', value: 'application/json', enabled: true }],
        params: [{ id: 'p1', key: 'query', value: 'search', enabled: true }],
        body: '{"foo":"bar"}',
        bodyType: 'json',
        auth: { type: 'none' }
      }
    }
  ]
}

describe('exportCollection', () => {
  it('should export native Rune JSON and strip isOpen', () => {
    const result = JSON.parse(exportCollection(mockCollection))
    expect(result.id).toBeUndefined()
    expect(result.isOpen).toBeUndefined()
    expect(result.items.length).toBe(1)
  })
})
