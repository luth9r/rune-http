import { describe, it, expect, vi } from 'vitest'
import { detectAndImport } from './index'

describe('detectAndImport', () => {
  it('should detect and import native Rune format', () => {
    const nativeCollection = {
      id: 'col-1',
      name: 'Rune Collection',
      items: [
        {
          id: 'req-1',
          name: 'Get Users',
          type: 'request',
          request: { method: 'GET', url: 'http://localhost' }
        }
      ]
    }
    const result = detectAndImport(JSON.stringify(nativeCollection))
    expect(result).not.toBeNull()
    expect(result?.type).toBe('collection')
    const data = result?.data as any
    expect(data.name).toBe('Rune Collection')
    expect(data.items.length).toBe(1)
  })

  it('should return null for invalid JSON', () => {
    const result = detectAndImport('invalid json {')
    expect(result).toBeNull()
  })

  it('should return null for unknown JSON structure', () => {
    const unknownJson = { foo: 'bar' }
    const result = detectAndImport(JSON.stringify(unknownJson))
    expect(result).toBeNull()
  })
})
