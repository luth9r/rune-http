import { VAR_PATTERN, VAR_EXACT } from './varPattern'

const DYNAMIC_VARS: Record<string, (param?: string) => any> = {
  '$guid': () => crypto.randomUUID(),
  '$uuid': () => crypto.randomUUID(),
  '$timestamp': () => Date.now(),
  '$isoTimestamp': () => new Date().toISOString(),
  '$randomInt': () => Math.floor(Math.random() * 1000),
  '$randomFloat': () => parseFloat(Math.random().toFixed(4)),
  '$randomBool': () => Math.random() > 0.5,
  '$randomEmail': () => `user_${Math.random().toString(36).slice(2, 8)}@example.com`,
  '$randomString': (p) => Math.random().toString(36).slice(2, 2 + (parseInt(p ?? '8') || 8)),
  '$date': (p) => {
    const d = new Date()
    return (p ?? 'YYYY-MM-DD')
      .replace('YYYY', d.getFullYear().toString())
      .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(d.getDate()).padStart(2, '0'))
      .replace('HH', String(d.getHours()).padStart(2, '0'))
      .replace('mm', String(d.getMinutes()).padStart(2, '0'))
      .replace('ss', String(d.getSeconds()).padStart(2, '0'))
  },
}

function resolveDynamic(key: string): { hit: true; value: string } | { hit: false } {
  const [name, param] = key.split(':')
  if (name in DYNAMIC_VARS) return { hit: true, value: String(DYNAMIC_VARS[name](param)) }
  return { hit: false }
}

export function interpolate(str: string, variables: Record<string, any>): string {
  // Exact match → pretty-print objects
  const exact = str.match(VAR_EXACT)
  if (exact) {
    const dyn = resolveDynamic(exact[1])
    if (dyn.hit) return dyn.value
    const val = variables[exact[1]]
    if (val !== undefined) return typeof val === 'string' ? val : JSON.stringify(val, null, 2)
  }

  return str.replace(new RegExp(VAR_PATTERN.source, 'g'), (match, key) => {
    const dyn = resolveDynamic(key)
    if (dyn.hit) return dyn.value
    const val = variables[key]
    return val === undefined ? match : typeof val === 'string' ? val : JSON.stringify(val)
  })
}

export function extractVariables(str: string): string[] {
  return [...str.matchAll(new RegExp(VAR_PATTERN.source, 'g'))].map(m => m[1])
}

export const DYNAMIC_VAR_HINTS: Record<string, string> = {
  '$guid': 'random UUID v4',
  '$uuid': 'random UUID v4',
  '$timestamp': 'unix timestamp (ms)',
  '$isoTimestamp': 'ISO 8601 date',
  '$randomInt': 'random 0–999',
  '$randomFloat': 'random float',
  '$randomBool': 'true / false',
  '$randomEmail': 'random email',
  '$randomString': 'random string ($randomString:16)',
  '$date': 'formatted date ($date:YYYY-MM-DD HH:mm)',
}