import { useCallback } from 'react'
import { useTabsStore } from '@/features/tabs/tabs.store'
import { useEnvStore } from '../features/environments/environments.store'

export function useHttpRequest() {
  const { setTabLoading, setTabResponse } = useTabsStore()
  const getActiveVariables = useEnvStore(s => s.getActiveVariables)

  const sendRequest = useCallback(
    async (tabId: string) => {
      const tab = useTabsStore.getState().tabs.find(t => t.id === tabId)
      if (!tab) return

      setTabLoading(tabId, true)

      try {
        const envVars = getActiveVariables()
        const result = await window.api.http.sendRequest(
          {
            id: tab.id,
            name: tab.name,
            method: tab.method,
            url: tab.url,
            headers: tab.headers,
            params: tab.params,
            body: tab.body,
            bodyType: tab.bodyType,
            auth: tab.auth,
          },
          envVars
        )

        if (result.success && result.data) {
          setTabResponse(tabId, result.data)
        } else {
          setTabResponse(tabId, null, result.error ?? 'Request failed')
        }
      } catch (err) {
        setTabResponse(
          tabId,
          null,
          err instanceof Error ? err.message : 'Unknown error'
        )
      }
    },
    [setTabLoading, setTabResponse, getActiveVariables]
  )

  return { sendRequest }
}
