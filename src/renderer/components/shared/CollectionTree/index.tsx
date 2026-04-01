import type { CollectionItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Folder } from 'lucide-react'
import { cn } from '@/lib/utils'
import './collection-tree.css'

interface CollectionTreeProps {
  items: CollectionItem[]
  selectedId?: string | null
  onSelect: (item: CollectionItem) => void
}

export function CollectionTree({
  items,
  selectedId,
  onSelect,
}: CollectionTreeProps) {
  const collections = items.filter(item => !item.request)

  return (
    <div className="collection-tree-root">
      {collections.map(item => (
        <CollectionNode
          isSelected={selectedId === item.id}
          item={item}
          key={item.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function CollectionNode({ item, isSelected, onSelect }: any) {
  return (
    <Button
      className={cn('collection-node', isSelected && 'is-selected')}
      onClick={() => onSelect(item)}
      variant="ghost"
    >
      <Folder
        className={cn('collection-node__icon', isSelected && 'is-active')}
        size={14}
      />
      <span className="collection-node__name">{item.name}</span>
    </Button>
  )
}
