import type { StateStorage } from 'zustand/middleware'

export const electronStorage: StateStorage = {
  getItem: async name => {
    const data = await window.api.storage.read<any>(name, null)

    if (data === null) return null

    return typeof data === 'object' ? JSON.stringify(data) : data
  },
  setItem: async (name, value) => {
    await window.api.storage.write(name, JSON.parse(value))
  },
  removeItem: async name => {
    await window.api.storage.write(name, null)
  },
}
