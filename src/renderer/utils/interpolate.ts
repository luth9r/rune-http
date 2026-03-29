/**
 * Replaces {{VAR}} placeholders with values from variables map
 * Example: "{{BASE_URL}}/users" → "http://localhost:3000/users"
 */
export function interpolate(
  str: string,
  variables: Record<string, any>
): string {
  // 1. If the string is EXACTLY a variable placeholder, return it (possibly pretty-printed if object)
  const exactMatch = str.match(/^\{\{([\w.-]+)\}\}$/)
  if (exactMatch) {
    const val = variables[exactMatch[1]]
    if (val !== undefined) {
      return typeof val === 'string' ? val : JSON.stringify(val, null, 2)
    }
  }

  // 2. Otherwise, do inline replacement
  return str.replace(/\{\{([\w.-]+)\}\}/g, (match, key) => {
    const val = variables[key]
    if (val === undefined) return match
    return typeof val === 'string' ? val : JSON.stringify(val)
  })
}

/**
 * Extracts all {{VAR}} variable names from a string
 */
export function extractVariables(str: string): string[] {
  const matches = str.matchAll(/\{\{([\w.-]+)\}\}/g)
  return [...matches].map(m => m[1])
}
