import type { Collection, CollectionItem } from '@/types'

export function exportToPostman(collection: Collection): any {
  const mapItem = (item: CollectionItem): any => {
    if (item.type !== 'request' || !item.request) return null

    const req = item.request
    return {
      name: item.name,
      request: {
        method: req.method,
        header: req.headers
          .filter(h => h.enabled && h.key)
          .map(h => ({
            key: h.key,
            value: h.value
          })),
        url: {
          raw: req.url,
          host: [req.url], // Simplification
        },
        body: req.bodyType === 'none' ? undefined : {
          mode: mapBodyMode(req.bodyType),
          raw: req.body,
          options: req.bodyType === 'json' ? {
            raw: { language: 'json' }
          } : undefined
        }
      }
    }
  }

  return {
    info: {
      name: collection.name,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: collection.items.map(mapItem).filter(i => i !== null)
  }
}

function mapBodyMode(type: string): string {
  if (type === 'json') return 'raw'
  if (type === 'urlencoded') return 'urlencoded'
  if (type === 'multipart') return 'formdata'
  return 'raw'
}
