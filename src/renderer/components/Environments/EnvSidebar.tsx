import type React from 'react'
import { useState, useMemo } from 'react'
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
  MeasuringStrategy,
} from '@dnd-kit/core'
import {
  SidebarRoot,
  SidebarHeader,
  SidebarList,
  SidebarInput,
} from 'renderer/components/Sidebar/components/SidebarLayout'
import { useResizable } from '@/hooks/useResizable'
import { useEnvStore } from '@/features/environments/environments.store'
import { EnvSidebarItem } from './EnvSidebarItem'
import type { Environment, DropPosition } from '@/types'
import { useTranslation } from '@/i18n'
import { GLOBAL_ENV_ID } from '@/features/environments/environments.constants'
import '@/components/Sidebar/sidebar.css'

interface EnvSidebarProps {
  onDelete: (env: Environment) => void
}

export function EnvSidebar({ onDelete }: EnvSidebarProps) {
  const { t } = useTranslation()
  const {
    environments,
    activeEnvId,
    activatedEnvId,
    setActiveEnv,
    setActivatedEnv,
    addEnvironment,
    renameEnvironment,
    moveEnvironment,
  } = useEnvStore()

  const { size: width, startResizing } = useResizable({
    persistenceKey: 'rune-sidebar-width', // Sharing same width for both sidebars for consistency
    initialSize: 240,
    minSize: 200,
    maxSize: 400,
    silent: true,
  })

  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [_overId, setOverId] = useState<string | null>(null)
  const [dropIndicator, setDropIndicator] = useState<{
    id: string
    type: DropPosition
  } | null>(null)

  const [isAddingMode, setIsAddingMode] = useState(false)
  const [newEnvName, setNewEnvName] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragStart = (e: DragStartEvent) => {
    setActiveDragId(e.active.id as string)
  }

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) {
      setDropIndicator(null)
      setOverId(null)
      return
    }

    setOverId(over.id as string)

    const activeRect = active.rect.current.translated
    const overRect = over.rect
    if (!activeRect || !overRect) return

    const activeCenter = activeRect.top + activeRect.height / 2
    const overCenter = overRect.top + overRect.height / 2

    setDropIndicator({
      id: over.id as string,
      type: activeCenter < overCenter ? 'before' : 'after',
    })
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    setActiveDragId(null)
    setOverId(null)
    setDropIndicator(null)

    if (over && active.id !== over.id && dropIndicator) {
      moveEnvironment(
        active.id as string,
        over.id as string,
        dropIndicator.type
      )
    }
  }

  const handleCommitAdd = () => {
    if (newEnvName.trim()) {
      addEnvironment(newEnvName.trim())
      setNewEnvName('')
      setIsAddingMode(false)
    }
  }

  const draggedEnv = useMemo(
    () => environments.find(e => e.id === activeDragId),
    [environments, activeDragId]
  )

  return (
    <SidebarRoot onResizeMouseDown={startResizing} style={{ width }}>
      <SidebarHeader onAdd={() => setIsAddingMode(true)} title={t('env.title')} />

      {isAddingMode && (
        <SidebarInput
          onCancel={() => setIsAddingMode(false)}
          onChange={setNewEnvName}
          onCommit={handleCommitAdd}
          placeholder={t('env.name_placeholder')}
          value={newEnvName}
        />
      )}

      <SidebarList>
        {environments.length === 0 && !isAddingMode && (
          <p style={s.emptyHint}>{t('env.no_envs')}</p>
        )}

        {/* Always show Global at the top, undraggable */}
        {environments
          .filter(e => e.id === GLOBAL_ENV_ID)
          .map(env => (
            <EnvSidebarItem
              env={env}
              isActive={activeEnvId === env.id}
              isActivated={activatedEnvId === env.id}
              key={env.id}
              onActivate={setActivatedEnv}
              onDelete={onDelete}
              onRename={renameEnvironment}
              onSelect={setActiveEnv}
            />
          ))}

        <DndContext
          collisionDetection={pointerWithin}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          {environments
            .filter(e => e.id !== GLOBAL_ENV_ID)
            .map(env => (
              <EnvSidebarItem
                dropIndicator={
                  dropIndicator?.id === env.id ? dropIndicator.type : null
                }
                env={env}
                isActive={activeEnvId === env.id}
                isActivated={activatedEnvId === env.id}
                isDragging={activeDragId === env.id}
                key={env.id}
                onActivate={setActivatedEnv}
                onDelete={onDelete}
                onRename={renameEnvironment}
                onSelect={setActiveEnv}
              />
            ))}

          <DragOverlay dropAnimation={null}>
            {activeDragId && draggedEnv ? (
              <div style={s.overlayItem}>
                <EnvSidebarItem
                  env={draggedEnv}
                  isActive={activeEnvId === draggedEnv.id}
                  isActivated={activatedEnvId === draggedEnv.id}
                  onActivate={() => {}}
                  onDelete={() => {}}
                  onRename={() => {}}
                  onSelect={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </SidebarList>
    </SidebarRoot>
  )
}

const s: Record<string, React.CSSProperties> = {
  emptyHint: {
    fontSize: 12,
    color: 'var(--eos-muted)',
    textAlign: 'center',
    marginTop: 24,
  },
  overlayItem: {
    width: 228,
    pointerEvents: 'none',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    borderRadius: 'var(--radius)',
    background: 'var(--eos-surface-2)',
  },
}
