import type { HttpRequest } from './http.types'

export type CollectionItemType = 'request'

export interface CollectionItem {
  id: string
  type: CollectionItemType
  name: string
  request?: HttpRequest
}

export interface Collection {
  id: string
  name: string
  items: CollectionItem[]
  isOpen?: boolean // expanded or collapsed in sidebar
  createdAt: number
  updatedAt: number
}
