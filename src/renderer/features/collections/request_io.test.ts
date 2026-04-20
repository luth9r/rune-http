import { describe, it, expect } from 'vitest'
import { exportRequest } from './exporters/index'
import { detectAndImport } from './importers/index'
import type { CollectionItem } from '@/types'

const mockRequestItem: CollectionItem = {
  id: 'req-123',
  type: 'request',
  name: 'Single Request',
  request: {
    id: 'req-123',
    name: 'Single Request',
    method: 'POST',
    url: 'https://api.test',
    headers: [],
    params: [],
    body: 'test body',
    bodyType: 'text',
    auth: { type: 'none' }
  }
}

describe('Request I/O', () => {
  describe('exportRequest', () => {
    it('should export single request as native JSON', () => {
      const result = JSON.parse(exportRequest(mockRequestItem, 'json'))
      expect(result.method).toBe('POST')
      expect(result.body).toBe('test body')
    })

    it('should export single request wrapped for Postman', () => {
      const result = JSON.parse(exportRequest(mockRequestItem, 'postman'))
      expect(result.info.name).toBe('Single Request')
      expect(result.item.length).toBe(1)
      expect(result.item[0].request.method).toBe('POST')
    })

    it('should export single request wrapped for Insomnia', () => {
      const result = JSON.parse(exportRequest(mockRequestItem, 'insomnia'))
      expect(result._type).toBe('export')
      const req = result.resources.find((r: any) => r._type === 'request')
      expect(req.name).toBe('Single Request')
    })
  })

  describe('import (via detectAndImport)', () => {
    it('should detect and import a single request as a collection with one item', () => {
      const singleRequestContent = JSON.stringify(mockRequestItem.request)
      const result = detectAndImport(singleRequestContent)
      
      expect(result).not.toBeNull()
      expect(result?.name).toBe('Single Request')
      expect(result?.items.length).toBe(1)
      expect(result?.items[0].request?.method).toBe('POST')
    })
  })
})
