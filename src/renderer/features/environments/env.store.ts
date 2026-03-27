import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { v4 as uuid } from "uuid";
import type { Environment } from "@/types";
import { electronStorage } from "renderer/lib/electronStorage";

interface EnvState {
  environments: Environment[];
  activeEnvId: string | null;
  addEnvironment: (name: string) => void;
  removeEnvironment: (id: string) => void;
  updateEnvironment: (id: string, variables: Record<string, string>) => void;
  renameEnvironment: (id: string, name: string) => void;
  setActiveEnv: (id: string | null) => void;
  getActiveVariables: () => Record<string, string>;
}

export const useEnvStore = create<EnvState>()(
  persist(
    immer((set, get) => ({
      environments: [],
      activeEnvId: null,

      addEnvironment: (name) =>
        set((state) => {
          state.environments.push({
            id: uuid(),
            name,
            variables: {},
            isActive: false,
          });
        }),

      removeEnvironment: (id) =>
        set((state) => {
          state.environments = state.environments.filter((e) => e.id !== id);
          if (state.activeEnvId === id) state.activeEnvId = null;
        }),

      updateEnvironment: (id, variables) =>
        set((state) => {
          const env = state.environments.find((e) => e.id === id);
          if (env) env.variables = variables;
        }),

      renameEnvironment: (id, name) =>
        set((state) => {
          const env = state.environments.find((e) => e.id === id);
          if (env) env.name = name;
        }),

      setActiveEnv: (id) =>
        set((state) => {
          state.activeEnvId = id;
        }),

      getActiveVariables: () => {
        const { environments, activeEnvId } = get();
        return environments.find((e) => e.id === activeEnvId)?.variables ?? {};
      },
    })),
    {
      name: "rune-environments",
      storage: createJSONStorage(() => electronStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.environments.length === 0) {
          state.environments.push({
            id: uuid(),
            name: "Rune",
            variables: {
              BASE_URL: "https://jsonplaceholder.typicode.com",
            },
            isActive: false,
          });
        }
      },
    },
  ),
);
