/**
 * Pretty-prints a JSON string with 2-space indentation
 */
export function prettyJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}

/**
 * Converts bytes to a human-readable size string
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Converts milliseconds to a human-readable duration string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

/**
 * Checks if a string is valid JSON
 */
export function isJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * Returns a Tailwind color class based on HTTP status code
 */
export function getStatusColor(status: number): string {
  if (status >= 500) return 'text-eos-delete'
  if (status >= 400) return 'text-eos-patch'
  if (status >= 300) return 'text-eos-put'
  if (status >= 200) return 'text-eos-post'
  return 'text-eos-muted'
}
