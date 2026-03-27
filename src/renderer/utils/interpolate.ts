/**
 * Replaces {{VAR}} placeholders with values from variables map
 * Example: "{{BASE_URL}}/users" → "http://localhost:3000/users"
 */
export function interpolate(
  str: string,
  variables: Record<string, string>,
): string {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

/**
 * Extracts all {{VAR}} variable names from a string
 */
export function extractVariables(str: string): string[] {
  const matches = str.matchAll(/\{\{(\w+)\}\}/g);
  return [...matches].map((m) => m[1]);
}
