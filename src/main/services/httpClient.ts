import fs from 'node:fs'
import path from 'node:path'
import type { HttpRequest, HttpResponse, KeyValuePair } from '@/types'
import { interpolate } from '@/utils'
import { net } from 'electron';

function resolveKV(
  kv: KeyValuePair,
  envVars: Record<string, any>
): { key: string; value: string } {
  return {
    key: interpolate(kv.key, envVars),
    value: interpolate(kv.value, envVars),
  }
}

function _buildUrl(
  url: string,
  params: KeyValuePair[],
  envVars: Record<string, any>
): string {
  const enabledParams = params.filter(p => p.enabled && p.key)
  if (enabledParams.length === 0) return url

  const searchParams = new URLSearchParams()
  enabledParams.forEach(p => {
    const resolved = resolveKV(p, envVars)
    searchParams.append(resolved.key, resolved.value)
  })

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${searchParams.toString()}`
}

function buildHeaders(
  headers: KeyValuePair[],
  envVars: Record<string, any>
): Record<string, string> {
  const result: Record<string, string> = {}
  headers
    .filter(h => h.enabled && h.key)
    .forEach(h => {
      const resolved = resolveKV(h, envVars)
      result[resolved.key] = resolved.value
    })
  return result
}

function buildCookies(
  cookies: KeyValuePair[] | undefined,
  envVars: Record<string, any>
): string {
  if (!cookies || cookies.length === 0) return ''
  return cookies
    .filter(c => c.enabled && c.key)
    .map(c => {
      const resolved = resolveKV(c, envVars)
      return `${resolved.key}=${resolved.value}`
    })
    .join('; ')
}

function applyAuth(
  headers: Record<string, string>,
  queryParams: URLSearchParams,
  request: HttpRequest,
  envVars: Record<string, any>
): void {
  const { auth } = request
  if (auth.type === 'none') return

  switch (auth.type) {
    case 'bearer':
      if (auth.token) {
        headers.Authorization = `Bearer ${interpolate(auth.token, envVars)}`
      }
      break
    case 'basic':
      if (auth.username && auth.password) {
        const u = interpolate(auth.username, envVars)
        const p = interpolate(auth.password, envVars)
        const encoded = Buffer.from(`${u}:${p}`).toString('base64')
        headers.Authorization = `Basic ${encoded}`
      }
      break
    case 'api-key':
      if (auth.apiKey && auth.apiValue) {
        const key = interpolate(auth.apiKey, envVars)
        const val = interpolate(auth.apiValue, envVars)
        if (auth.apiKeyIn === 'header') {
          headers[key] = val
        } else {
          queryParams.append(key, val)
        }
      }
      break
  }
}

export async function executeRequest(
  request: HttpRequest,
  envVars: Record<string, any> = {}
): Promise<HttpResponse> {
  const startTime = Date.now()

  // 1. Prepare Headers
  const headers = buildHeaders(request.headers, envVars)

  // 2. Build URL + Query Params
  const rawUrl = interpolate(request.url, envVars)
  const urlObj = new URL(rawUrl)
  const _queryParams = new URLSearchParams()

  request.params
    .filter(p => p.enabled && p.key)
    .forEach(p => {
      const resolved = resolveKV(p, envVars)
      urlObj.searchParams.append(resolved.key, resolved.value)
    })

  applyAuth(headers, urlObj.searchParams, request, envVars)

  const cookieString = buildCookies(request.cookies, envVars)
  if (cookieString) {
    headers['Cookie'] = cookieString
  }

  const url = urlObj.toString()

  let body: any
  const hasBody =
    !['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
    request.bodyType !== 'none'

  if (hasBody) {
    if (request.bodyType === 'multipart') {
      const formData = new FormData()

      let fields: KeyValuePair[] = []
      try {
        fields = JSON.parse(request.body)
      } catch { fields = [] }

      fields
        .filter(kv => kv.enabled && kv.key)
        .forEach(kv => {
          const resolved = resolveKV(kv, envVars)
          if (kv.type === 'file' && resolved.value) {
            const resolvedPath = resolved.value
            if (fs.existsSync(resolvedPath)) {
              const buffer = fs.readFileSync(resolvedPath)
              formData.append(resolved.key, new Blob([buffer]), path.basename(resolvedPath))
            }
          } else {
            formData.append(resolved.key, resolved.value)
          }
        })

      body = formData
      delete headers['Content-Type']
    } else if (request.bodyType === 'urlencoded') {
      const formData = new URLSearchParams()
      let fields: KeyValuePair[] = []
      try {
        fields = JSON.parse(request.body)
      } catch {
        new URLSearchParams(request.body).forEach((v, k) => formData.append(k, v))
      }

      fields
        .filter(kv => kv.enabled && kv.key)
        .forEach(kv => {
          const resolved = resolveKV(kv, envVars)
          formData.append(resolved.key, resolved.value)
        })

      body = formData
      headers['Content-Type'] ??= 'application/x-www-form-urlencoded'
    } else if (request.bodyType === 'binary') {
      const resolvedPath = interpolate(request.body, envVars)
      if (fs.existsSync(resolvedPath)) {
        body = fs.readFileSync(resolvedPath)
        const ext = path.extname(resolvedPath).toLowerCase()
        const mimes: Record<string, string> = {
          '.pdf': 'application/pdf',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.zip': 'application/zip',
          '.json': 'application/json',
          '.xml': 'application/xml',
          '.txt': 'text/plain',
        }
        headers['Content-Type'] ??= mimes[ext] || 'application/octet-stream'
      }
    } else {
      body = interpolate(request.body || '', envVars)
      const mimes: Record<string, string> = {
        json: 'application/json',
        xml: 'application/xml',
        text: 'text/plain',
      }
      headers['Content-Type'] ??= mimes[request.bodyType] || 'text/plain'
    }
  }

  const response = await fetch(url, {
    method: request.method,
    headers,
    body,
  })

  const duration = Date.now() - startTime
  const bodyText = await response.text()

  const responseHeaders: Record<string, string> = {}
  const responseCookies: Record<string, string> = {}

  response.headers.forEach((v, k) => {
    responseHeaders[k] = v
  })

  // Better cookie parsing using getSetCookie if available
  const setCookies = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : (responseHeaders['set-cookie'] ? [responseHeaders['set-cookie']] : [])

  setCookies.forEach(v => {
    const cookieParts = v.split(';')
    if (cookieParts.length > 0) {
      const firstPart = cookieParts[0]
      const eqIdx = firstPart.indexOf('=')
      if (eqIdx !== -1) {
        const cookieKey = firstPart.substring(0, eqIdx).trim()
        const cookieVal = firstPart.substring(eqIdx + 1).trim()
        responseCookies[cookieKey] = cookieVal
      }
    }
  })

  return {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    cookies: responseCookies,
    body: bodyText,
    size: new TextEncoder().encode(bodyText).length,
    duration,
    timestamp: Date.now(),
  }
}
