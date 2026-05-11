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
      const result = JSON.parse(exportRequest(mockRequestItem))
      expect(result.method).toBe('POST')
      expect(result.body).toBe('test body')
    })
  })

  describe('import (via detectAndImport)', () => {
    it('should detect and import a single request as a collection with one item', () => {
      const singleRequestContent = JSON.stringify(mockRequestItem.request)
      const result = detectAndImport(singleRequestContent)
      
      expect(result).not.toBeNull()
      expect(result?.type).toBe('request')
      const data = result?.data as any
      expect(data?.name).toBe('Single Request')
      expect(data?.method).toBe('POST')
    })
  })
})
