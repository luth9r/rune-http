import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuid } from 'uuid'
import type { Environment, DropPosition } from '@/types'
import { electronStorage } from 'renderer/lib/electronStorage'
import { GLOBAL_ENV_ID, GLOBAL_ENV_NAME } from './environments.constants'

interface EnvState {
  environments: Environment[]
  activeEnvId: string | null
  activatedEnvId: string | null
  addEnvironment: (name: string) => void
  removeEnvironment: (id: string) => void
  moveEnvironment: (
    activeId: string,
    targetId: string,
    position: DropPosition
  ) => void
  updateEnvironment: (id: string, variables: Record<string, any>) => void
  renameEnvironment: (id: string, name: string) => void
  setActiveEnv: (id: string | null) => void
  setActivatedEnv: (id: string | null) => void
  getActiveVariables: () => Record<string, any>
  setDirty: (id: string, isDirty: boolean) => void
  saveEnvironment: (id: string, variables: Record<string, any>) => void
  updateDraft: (id: string, draft: string | null) => void
}

export const useEnvStore = create<EnvState>()(
  persist(
    immer((set, get) => ({
      environments: [],
      activeEnvId: null,
      activatedEnvId: null,

      addEnvironment: name =>
        set(state => {
          state.environments.push({
            id: uuid(),
            name,
            variables: {},
            isActive: false,
          })
        }),

      removeEnvironment: id =>
        set(state => {
          if (id === GLOBAL_ENV_ID) return
          state.environments = state.environments.filter(e => e.id !== id)
          if (state.activeEnvId === id) state.activeEnvId = null
          if (state.activatedEnvId === id) state.activatedEnvId = null
        }),

      moveEnvironment: (activeId, targetId, position) =>
        set(state => {
          const oldIndex = state.environments.findIndex(e => e.id === activeId)
          let newIndex = state.environments.findIndex(e => e.id === targetId)

          if (oldIndex !== -1 && newIndex !== -1) {
            const [moved] = state.environments.splice(oldIndex, 1)
            // After splice, if the target was after the original, its index shifted down
            if (oldIndex < newIndex) {
              newIndex = state.environments.findIndex(e => e.id === targetId)
            }
            const finalIndex = position === 'after' ? newIndex + 1 : newIndex
            state.environments.splice(finalIndex, 0, moved)
          }
        }),

      updateEnvironment: (id, variables) =>
        set(state => {
          const env = state.environments.find(e => e.id === id)
          if (env) env.variables = variables
        }),

      renameEnvironment: (id, name) =>
        set(state => {
          const env = state.environments.find(e => e.id === id)
          if (env) env.name = name
        }),

      setActiveEnv: id =>
        set(state => {
          state.activeEnvId = id
        }),

      setActivatedEnv: id =>
        set(state => {
          state.activatedEnvId = id
        }),

      getActiveVariables: () => {
        const { environments, activatedEnvId } = get()
        const globalEnv = environments.find(e => e.id === GLOBAL_ENV_ID)
        const activeEnv = environments.find(e => e.id === activatedEnvId)

        const globalVars = globalEnv?.variables ?? {}
        const activeVars = activeEnv?.variables ?? {}

        // Target active overrides global
        return { ...globalVars, ...activeVars }
      },

      setDirty: (id, isDirty) =>
        set(state => {
          const env = state.environments.find(e => e.id === id)
          if (env) env.isDirty = isDirty
        }),

      saveEnvironment: (id: string, variables: Record<string, string>) =>
        set(state => {
          const env = state.environments.find(e => e.id === id)
          if (env) {
            env.variables = variables
            env.isDirty = false
            env.draftValue = undefined
          }
        }),
      updateDraft: (id, draft) =>
        set(state => {
          const env = state.environments.find(e => e.id === id)
          if (env) {
            env.draftValue = draft ?? undefined
          }
        }),
    })),
    {
      name: 'rune-environments',
      storage: createJSONStorage(() => electronStorage),
      onRehydrateStorage: () => state => {
        if (state && state.environments.length === 0) {
          state.environments.push({
            id: GLOBAL_ENV_ID,
            name: GLOBAL_ENV_NAME,
            variables: {
              BASE_URL: 'https://jsonplaceholder.typicode.com',
            },
            isActive: false,
          })
          state.activeEnvId = GLOBAL_ENV_ID
        }
      },
    }
  )
)
