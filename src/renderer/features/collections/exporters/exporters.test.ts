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
    const result = JSON.parse(exportCollection(mockCollection, 'json'))
    expect(result.id).toBe('col-123')
    expect(result.isOpen).toBeUndefined()
    expect(result.items.length).toBe(1)
  })

  it('should export to Postman v2.1 format', () => {
    const result = JSON.parse(exportCollection(mockCollection, 'postman'))
    expect(result.info.name).toBe('Test Collection')
    expect(result.info.schema).toContain('postman.com/json/collection/v2.1.0')
    expect(result.item.length).toBe(1)
    expect(result.item[0].request.method).toBe('GET')
  })

  it('should export to Insomnia v4 format', () => {
    const result = JSON.parse(exportCollection(mockCollection, 'insomnia'))
    expect(result._type).toBe('export')
    expect(result.__export_format).toBe(4)
    const req = result.resources.find((r: any) => r._type === 'request')
    expect(req.name).toBe('Get Data')
    expect(req.method).toBe('GET')
  })
})
