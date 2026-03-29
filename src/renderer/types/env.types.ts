export interface Environment {
  id: string
  name: string
  variables: Record<string, any>
  isActive: boolean
  isDirty?: boolean
  draftValue?: string
}

export interface EnvStore {
  environments: Environment[]
  activeEnvId: string | null
}
