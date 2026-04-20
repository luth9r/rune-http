import type { Collection, CollectionItem } from '@/types'
import { v4 as uuid } from 'uuid'

export function exportToInsomnia(collection: Collection): any {
  const timestamp = Math.floor(Date.now() / 1000)
  const resources: any[] = []

  const workspaceId = `wrk_${uuid().replace(/-/g, '')}`
  resources.push({
    _id: workspaceId,
    _type: 'workspace',
    name: collection.name,
    created: timestamp,
    modified: timestamp,
    parentId: null
  })

  collection.items.forEach(item => {
    if (item.type !== 'request' || !item.request) return
    
    const req = item.request
    resources.push({
      _id: `req_${uuid().replace(/-/g, '')}`,
      _type: 'request',
      parentId: workspaceId,
      name: item.name,
      method: req.method,
      url: req.url,
      headers: req.headers
        .filter(h => h.enabled && h.key)
        .map(h => ({
          name: h.key,
          value: h.value
        })),
      body: {
        text: req.body,
        mimeType: mapMimeType(req.bodyType)
      },
      parameters: req.params
        .filter(p => p.enabled && p.key)
        .map(p => ({
          name: p.key,
          value: p.value
        })),
      created: timestamp,
      modified: timestamp
    })
  })

  return {
    _type: 'export',
    __export_format: 4,
    __export_date: new Date().toISOString(),
    __export_source: 'rune-http',
    resources
  }
}

function mapMimeType(type: string): string {
  if (type === 'json') return 'application/json'
  if (type === 'xml') return 'application/xml'
  if (type === 'text') return 'text/plain'
  if (type === 'urlencoded') return 'application/x-www-form-urlencoded'
  if (type === 'multipart') return 'multipart/form-data'
  return ''
}
