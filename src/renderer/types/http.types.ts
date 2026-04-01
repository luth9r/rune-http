export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'

export type BodyType =
  | 'json'
  | 'xml'
  | 'text'
  | 'form-data'
  | 'urlencoded'
  | 'multipart'
  | 'binary'
  | 'none'

export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key'

export interface KeyValuePair {
  id: string
  key: string
  value: string
  enabled: boolean
  type?: 'text' | 'file'
}

export interface AuthConfig {
  type: AuthType
  token?: string
  username?: string
  password?: string
  apiKey?: string
  apiValue?: string
  apiKeyIn?: 'header' | 'query'
}

export interface HttpRequest {
  id: string
  name: string
  method: HttpMethod
  url: string
  headers: KeyValuePair[]
  params: KeyValuePair[]
  body: string
  bodyType: BodyType
  bodies?: Record<string, string>
  auth: AuthConfig
}

export interface HttpResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  size: number // bytes
  duration: number // ms
  timestamp: number
}

export interface RequestState {
  request: HttpRequest
  response: HttpResponse | null
  isLoading: boolean
  error: string | null
}
