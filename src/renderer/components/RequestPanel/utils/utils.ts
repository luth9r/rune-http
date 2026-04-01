import type { BodyType, KeyValuePair } from '@/types'

export const BODY_OPTIONS = [
  { label: 'No Body', value: 'none' },
  { label: 'JSON', value: 'json' },
  { label: 'XML', value: 'xml' },
  { label: 'Text', value: 'text' },
  { label: 'Form URL Encoded', value: 'urlencoded' },
  { label: 'Multipart Form', value: 'multipart' },
  { label: 'Binary File', value: 'binary' },
]

export const REQUEST_TABS = ['Params', 'Headers', 'Body', 'Auth'] as const
export type RequestTab = (typeof REQUEST_TABS)[number]

export function getCount(items: KeyValuePair[]) {
  return items.filter(p => p.enabled && p.key).length
}

export function parseFormBody(
  body: string,
  isMultipart: boolean
): KeyValuePair[] {
  if (!body)
    return [{ id: '1', key: '', value: '', enabled: true, type: 'text' }]

  try {
    if ((isMultipart || body.includes('{"id":')) && body.includes('\n')) {
      return body
        .split('\n')
        .filter(l => l.trim())
        .map(l => JSON.parse(l))
    }

    if (isMultipart && body.startsWith('[{')) {
      return JSON.parse(body)
    }

    const params = new URLSearchParams(body)
    const result: KeyValuePair[] = []
    params.forEach((value, key) => {
      result.push({
        id: Math.random().toString(),
        key,
        value,
        enabled: true,
        type: 'text',
      })
    })
    return result.length
      ? result
      : [{ id: '1', key: '', value: '', enabled: true, type: 'text' }]
  } catch {
    return [{ id: '1', key: '', value: '', enabled: true, type: 'text' }]
  }
}

export function serializeFormBody(
  data: KeyValuePair[],
  bodyType: BodyType
): string {
  if (bodyType === 'multipart' || bodyType === 'urlencoded') {
    return data.map(item => JSON.stringify(item)).join('\n')
  }

  const params = new URLSearchParams()
  data.forEach(item => {
    if (item.enabled && item.key) {
      params.append(item.key, item.value)
    }
  })
  return params.toString()
}
