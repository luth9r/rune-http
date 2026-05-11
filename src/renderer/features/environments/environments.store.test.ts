import { describe, it, expect, beforeEach } from 'vitest'
import { useEnvStore } from './environments.store'

beforeEach(() => {
  useEnvStore.setState({ environments: [], activeEnvId: null })
})

describe('env store', () => {
  it('adds an environment', () => {
    useEnvStore.getState().addEnvironment('Staging')
    const { environments } = useEnvStore.getState()
    expect(environments).toHaveLength(1)
    expect(environments[0].name).toBe('Staging')
    expect(environments[0].variables).toEqual({})
  })

  it('removes an environment', () => {
    useEnvStore.getState().addEnvironment('To Delete')
    const { environments } = useEnvStore.getState()
    useEnvStore.getState().removeEnvironment(environments[0].id)
    expect(useEnvStore.getState().environments).toHaveLength(0)
  })

  it('clears activeEnvId when active env is removed', () => {
    useEnvStore.getState().addEnvironment('Local')
    const { environments } = useEnvStore.getState()
    useEnvStore.getState().setActiveEnv(environments[0].id)
    useEnvStore.getState().removeEnvironment(environments[0].id)
    expect(useEnvStore.getState().activeEnvId).toBeNull()
  })

  it('updates environment variables', () => {
    useEnvStore.getState().addEnvironment('Local')
    const { environments } = useEnvStore.getState()
    useEnvStore.getState().updateEnvironment(environments[0].id, {
      BASE_URL: 'http://localhost:3000',
      TOKEN: 'secret',
    })
    const updated = useEnvStore.getState().environments[0]
    expect(updated.variables.BASE_URL).toBe('http://localhost:3000')
    expect(updated.variables.TOKEN).toBe('secret')
  })

  it('renames an environment', () => {
    useEnvStore.getState().addEnvironment('Old Name')
    const { environments } = useEnvStore.getState()
    useEnvStore.getState().renameEnvironment(environments[0].id, 'New Name')
    expect(useEnvStore.getState().environments[0].name).toBe('New Name')
  })

  it('sets active environment', () => {
    useEnvStore.getState().addEnvironment('Local')
    const { environments } = useEnvStore.getState()
    useEnvStore.getState().setActiveEnv(environments[0].id)
    expect(useEnvStore.getState().activeEnvId).toBe(environments[0].id)
  })

  it('getActiveVariables returns variables of active env', () => {
    useEnvStore.getState().addEnvironment('Local')
    const { environments } = useEnvStore.getState()
    useEnvStore.getState().updateEnvironment(environments[0].id, {
      BASE_URL: 'http://localhost:3000',
    })
    useEnvStore.getState().setActivatedEnv(environments[0].id)
    const vars = useEnvStore.getState().getActiveVariables()
    expect(vars.BASE_URL).toBe('http://localhost:3000')
  })

  it('getActiveVariables returns empty object if no active env', () => {
    const vars = useEnvStore.getState().getActiveVariables()
    expect(vars).toEqual({})
  })

  it('sets activated environment', () => {
    useEnvStore.getState().addEnvironment('Staging')
    const { environments } = useEnvStore.getState()
    useEnvStore.getState().setActivatedEnv(environments[0].id)
    expect(useEnvStore.getState().activatedEnvId).toBe(environments[0].id)
  })

  it('sets dirty flag', () => {
    useEnvStore.getState().addEnvironment('Staging')
    const { environments } = useEnvStore.getState()
    useEnvStore.getState().setDirty(environments[0].id, true)
    expect(useEnvStore.getState().environments[0].isDirty).toBe(true)
  })

  it('saves environment and clears dirty/draft', () => {
    useEnvStore.getState().addEnvironment('Staging')
    const { environments } = useEnvStore.getState()
    const id = environments[0].id
    useEnvStore.getState().setDirty(id, true)
    useEnvStore.getState().updateDraft(id, 'draft')
    
    useEnvStore.getState().saveEnvironment(id, { FOO: 'BAR' })
    const updated = useEnvStore.getState().environments[0]
    expect(updated.variables.FOO).toBe('BAR')
    expect(updated.isDirty).toBe(false)
    expect(updated.draftValue).toBeUndefined()
  })

  it('imports environments', () => {
    const envsToImport = [
      { name: 'Imported', variables: { KEY: 'VAL' }, isActive: false }
    ] as any
    useEnvStore.getState().importEnvironments(envsToImport)
    const { environments } = useEnvStore.getState()
    expect(environments).toHaveLength(1)
    expect(environments[0].name).toBe('Imported')
  })

  it('exports environments without internal fields', () => {
    useEnvStore.getState().addEnvironment('To Export')
    const id = useEnvStore.getState().environments[0].id
    useEnvStore.getState().setDirty(id, true)
    
    const exported = useEnvStore.getState().exportEnvironments()
    expect(exported[0].name).toBe('To Export')
    expect((exported[0] as any).id).toBeUndefined()
    expect((exported[0] as any).isDirty).toBeUndefined()
  })

  it('moves environment', () => {
    useEnvStore.getState().addEnvironment('Env 1')
    useEnvStore.getState().addEnvironment('Env 2')
    const { environments } = useEnvStore.getState()
    const id1 = environments[0].id
    const id2 = environments[1].id
    
    useEnvStore.getState().moveEnvironment(id1, id2, 'after')
    const newEnvs = useEnvStore.getState().environments
    expect(newEnvs[0].id).toBe(id2)
    expect(newEnvs[1].id).toBe(id1)
  })
})
