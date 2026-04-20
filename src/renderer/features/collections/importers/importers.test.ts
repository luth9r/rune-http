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
    expect(result).toEqual(nativeCollection)
  })

  it('should detect and import Postman v2.1 format', () => {
    const postmanCollection = {
      info: {
        name: 'Postman Collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [
        {
          name: 'First Request',
          request: {
            method: 'POST',
            url: { raw: 'https://api.example.com' }
          }
        }
      ]
    }
    const result = detectAndImport(JSON.stringify(postmanCollection))
    expect(result?.name).toBe('Postman Collection')
    expect(result?.items.length).toBe(1)
    expect(result?.items[0].name).toBe('First Request')
  })

  it('should detect and import Insomnia export format', () => {
    const insomniaExport = {
      _type: 'export',
      resources: [
        {
          _type: 'request',
          name: 'Insomnia Request',
          method: 'PUT',
          url: 'https://insomnia.rest'
        }
      ]
    }
    const result = detectAndImport(JSON.stringify(insomniaExport))
    expect(result?.name).toBe('Imported Insomnia Collection')
    expect(result?.items.length).toBe(1)
    expect(result?.items[0].name).toBe('Insomnia Request')
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
