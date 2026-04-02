import { v4 as uuid } from 'uuid'
import type { Collection, CollectionItem } from '@/types'
import { parseUrlParams, updateUrlWithParams } from '@/utils/url'

export function importInsomnia(data: any): Collection {
  const resources = data.resources || []
  
  // Find the workspace or collection root
  const collectionResource = resources.find((r: any) => r._type === 'workspace' || r._type === 'request_group')
  
  const mapItem = (resource: any): CollectionItem | null => {
    if (resource._type !== 'request') return null
    
    const finalParams = [
      ...(Array.isArray(resource.parameters)
        ? resource.parameters.map((p: any) => ({
            id: uuid(),
            key: p.name,
            value: p.value,
            enabled: true
          }))
        : []),
      ...parseUrlParams(resource.url || '')
    ]

    const id = uuid()
    return {
      id,
      type: 'request',
      name: resource.name || 'Imported Request',
      request: {
        id,
        name: resource.name || 'Imported Request',
        method: resource.method || 'GET',
        url: updateUrlWithParams(resource.url || '', finalParams),
        headers: Array.isArray(resource.headers)
          ? resource.headers.map((h: any) => ({
              id: uuid(),
              key: h.name,
              value: h.value,
              enabled: true
            }))
          : [],
        params: finalParams,
        body: resource.body?.text || '',
        bodyType: mapBodyType(resource.body?.mimeType),
        auth: { type: 'none' },
      }
    }
  }

  const items = resources
    .map(mapItem)
    .filter((i: any): i is CollectionItem => i !== null)

  return {
    id: uuid(),
    name: collectionResource?.name || 'Imported Insomnia Collection',
    items,
    isOpen: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

function mapBodyType(mimeType: string | undefined): any {
  if (!mimeType) return 'none'
  if (mimeType.includes('json')) return 'json'
  if (mimeType.includes('multipart')) return 'multipart'
  if (mimeType.includes('x-www-form-urlencoded')) return 'form-urlencoded'
  return 'none'
}
