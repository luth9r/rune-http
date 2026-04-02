import { v4 as uuid } from 'uuid'
import type { Collection, CollectionItem } from '@/types'
import { parseUrlParams, updateUrlWithParams } from '@/utils/url'

export function importPostman(data: any): Collection {
  const info = data.info || {}
  
  const processItems = (items: any[]): CollectionItem[] => {
    return items.map(item => {
      const id = uuid()
      
      // If it has 'item', it's a folder (not supported natively as nested folders yet, but we'll adapt)
      // Actually, Rune currently supports a flat list of requests in a collection.
      // We'll flatten the Postman items for now or handle them as a single level.
      
      if (item.item) {
        // Recursive flattening for now since our UI doesn't support nested folders fully yet
        // Wait, does Rune support nested folders? Let's check CollectionItem type.
        return processItems(item.item)
      }

      const request = item.request
      if (!request) return []

      const rawUrl = typeof request.url === 'string' ? request.url : request.url?.raw || ''
      const finalParams = [
        ...(typeof request.url === 'object' && Array.isArray(request.url.query)
          ? request.url.query.map((q: any) => ({
              id: uuid(),
              key: q.key,
              value: q.value,
              enabled: !q.disabled
            }))
          : []),
        ...parseUrlParams(rawUrl)
      ]

      return {
        id,
        type: 'request',
        name: item.name || 'Imported Request',
        request: {
          id,
          name: item.name || 'Imported Request',
          method: request.method || 'GET',
          url: updateUrlWithParams(rawUrl, finalParams),
          headers: Array.isArray(request.header) 
            ? request.header.map((h: any) => ({ 
                id: uuid(), 
                key: h.key, 
                value: h.value, 
                enabled: !h.disabled 
              }))
            : [],
          params: finalParams,
          body: request.body?.raw || '',
          bodyType: mapBodyType(request.body?.mode),
          auth: { type: 'none' }, // Simple for now
        }
      }
    }).flat() as CollectionItem[]
  }

  return {
    id: uuid(),
    name: info.name || 'Imported Postman Collection',
    items: processItems(data.item || []),
    isOpen: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

function mapBodyType(mode: string | undefined): any {
  switch (mode) {
    case 'raw': return 'json' // Defaulting to JSON for raw
    case 'formdata': return 'multipart'
    case 'urlencoded': return 'form-urlencoded'
    default: return 'none'
  }
}
