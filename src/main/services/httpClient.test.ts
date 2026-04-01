import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeRequest } from './httpClient'

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}))

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('httpClient interpolation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: () => Promise.resolve('{}'),
    })
  })

  it('interpolates URL path and query parameters', async () => {
    const request: any = {
      method: 'GET',
      url: '{{HOST}}/api/{{PATH}}',
      headers: [],
      params: [
        { key: 'q', value: '{{QUERY}}', enabled: true },
        { key: '{{KEY_VAR}}', value: 'val', enabled: true },
      ],
      auth: { type: 'none' },
    }

    const env = {
      HOST: 'https://example.com',
      PATH: 'items',
      QUERY: 'search-term',
      KEY_VAR: 'filter',
    }

    await executeRequest(request, env)

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('https://example.com/api/items')
    expect(url).toContain('q=search-term')
    expect(url).toContain('filter=val')
  })

  it('interpolates headers', async () => {
    const request: any = {
      method: 'GET',
      url: 'http://api.com',
      headers: [
        { key: 'Authorization', value: 'Bearer {{TOKEN}}', enabled: true },
        { key: 'X-{{HEADER_NAME}}', value: '{{HEADER_VAL}}', enabled: true },
      ],
      params: [],
      auth: { type: 'none' },
    }

    const env = {
      TOKEN: 'secret-123',
      HEADER_NAME: 'Custom',
      HEADER_VAL: 'value',
    }

    await executeRequest(request, env)

    const options = mockFetch.mock.calls[0][1]
    expect(options.headers.Authorization).toBe('Bearer secret-123')
    expect(options.headers['X-Custom']).toBe('value')
  })

  it('interpolates authentication credentials', async () => {
    const request: any = {
      method: 'GET',
      url: 'http://api.com',
      headers: [],
      params: [],
      auth: {
        type: 'basic',
        username: '{{USER}}',
        password: '{{PASS}}',
      },
    }

    const env = { USER: 'admin', PASS: '1234' }
    await executeRequest(request, env)

    const options = mockFetch.mock.calls[0][1]
    const expectedAuth = `Basic ${Buffer.from('admin:1234').toString('base64')}`
    expect(options.headers.Authorization).toBe(expectedAuth)
  })

  it('interpolates API Key in query', async () => {
    const request: any = {
      method: 'GET',
      url: 'http://api.com/data',
      headers: [],
      params: [],
      auth: {
        type: 'api-key',
        apiKey: 'api_key',
        apiValue: '{{MY_KEY}}',
        apiKeyIn: 'query',
      },
    }

    const env = { MY_KEY: 'top-secret' }
    await executeRequest(request, env)

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('api_key=top-secret')
  })

  it('interpolates raw body content', async () => {
    const request: any = {
      method: 'POST',
      url: 'http://api.com',
      body: '{"id": "{{ID}}", "name": "{{NAME}}"}',
      bodyType: 'json',
      headers: [],
      params: [],
      auth: { type: 'none' },
    }

    const env = { ID: '101', NAME: 'Test Item' }
    await executeRequest(request, env)

    const options = mockFetch.mock.calls[0][1]
    expect(options.body).toBe('{"id": "101", "name": "Test Item"}')
  })

  it('interpolates urlencoded form body', async () => {
    const formData = [
      { key: 'user', value: '{{USER_NAME}}', enabled: true },
      { key: '{{FIELD_KEY}}', value: 'some-value', enabled: true },
    ]

    const request: any = {
      method: 'POST',
      url: 'http://api.com',
      body: JSON.stringify(formData),
      bodyType: 'urlencoded',
      headers: [],
      params: [],
      auth: { type: 'none' },
    }

    const env = { USER_NAME: 'Alice', FIELD_KEY: 'role' }
    await executeRequest(request, env)

    const options = mockFetch.mock.calls[0][1]
    expect(options.body.toString()).toContain('user=Alice')
    expect(options.body.toString()).toContain('role=some-value')
  })

  it('interpolates multipart form body including file paths', async () => {
    const formData = [
      { key: 'field', value: '{{VAL}}', enabled: true, type: 'text' },
      { key: 'file', value: '{{DIR}}/upload.txt', enabled: true, type: 'file' },
    ]

    const request: any = {
      method: 'POST',
      url: 'http://api.com',
      body: JSON.stringify(formData),
      bodyType: 'multipart',
      headers: [],
      params: [],
      auth: { type: 'none' },
    }

    const env = { VAL: 'hello', DIR: '/tmp' }

    const { default: mockedFs } = await import('node:fs')
    // @ts-expect-error
    mockedFs.existsSync.mockReturnValue(true)
    // @ts-expect-error
    mockedFs.readFileSync.mockReturnValue(Buffer.from('file content'))

    await executeRequest(request, env)

    expect(mockedFs.existsSync).toHaveBeenCalledWith('/tmp/upload.txt')

    const options = mockFetch.mock.calls[0][1]
    expect(options.body).toBeInstanceOf(FormData)
  })

  it('handles variables with dots and hyphens', async () => {
    const request: any = {
      method: 'GET',
      url: '{{api.host}}/{{resource-id}}',
      headers: [],
      params: [],
      auth: { type: 'none' },
    }

    const env = {
      'api.host': 'https://api.test',
      'resource-id': '999',
    }

    await executeRequest(request, env)

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('https://api.test/999')
  })

  it('interpolates object variables in JSON body (standalone)', async () => {
    const request: any = {
      method: 'POST',
      url: 'http://api.com',
      body: '{{MY_OBJECT}}',
      bodyType: 'json',
      headers: [],
      params: [],
      auth: { type: 'none' },
    }

    const env = {
      MY_OBJECT: { id: 123, status: 'active' },
    }

    await executeRequest(request, env)

    const options = mockFetch.mock.calls[0][1]
    // Should be pretty-printed since it's an exact match
    expect(options.body).toContain('"id": 123')
    expect(options.body).toContain('"status": "active"')
  })

  it('interpolates object variables in JSON body (inline)', async () => {
    const request: any = {
      method: 'POST',
      url: 'http://api.com',
      body: '{"data": {{MY_OBJECT}}, "meta": "info"}',
      bodyType: 'json',
      headers: [],
      params: [],
      auth: { type: 'none' },
    }

    const env = {
      MY_OBJECT: { id: 123 },
    }

    await executeRequest(request, env)

    const options = mockFetch.mock.calls[0][1]
    // Should be inline (no pretty-print)
    expect(options.body).toBe('{"data": {"id":123}, "meta": "info"}')
  })
})
