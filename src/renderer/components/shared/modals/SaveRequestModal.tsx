import { FolderTree } from 'lucide-react'
import { useState } from 'react'
import { CollectionTree } from '@/components/shared/CollectionTree'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTabsStore } from '@/features/tabs/tabs.store'
import { useCollectionsStore } from '@/features/collections/collections.store'
import './save-request-modal.css'

export function SaveRequestModal({
  isOpen,
  onClose,
  tabId,
}: {
  isOpen: boolean
  onClose: () => void
  tabId: string
}) {
  const collections = useCollectionsStore(s => s.collections)
  const addRequest = useCollectionsStore(s => s.addRequest)
  const { tabs, markClean, updateTab } = useTabsStore()

  const tab = tabs.find(t => t.id === tabId)
  const [name, setName] = useState(tab?.name || '')

  const [selectedLocation, setSelectedLocation] = useState<{
    colId: string
    folderId?: string
  } | null>(null)

  const handleSave = () => {
    if (!selectedLocation || !tab) return

    const newItemId = addRequest(selectedLocation.colId, {
      name: name.trim() || 'New Request',
      method: tab.method,
      url: tab.url,
      headers: tab.headers,
      params: tab.params,
      body: tab.body,
      bodyType: tab.bodyType,
      auth: tab.auth,
    })

    updateTab(tabId, {
      requestId: newItemId,
      collectionId: selectedLocation.colId,
      name: name.trim() || 'New Request',
    })

    markClean(tabId)
    onClose()
  }

  const isColSelected = (colId: string) =>
    selectedLocation?.colId === colId && !selectedLocation.folderId

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Request">
      <div className="save-modal-container">
        {/* Name */}
        <div className="modal-field">
          <label className="modal-label">Request Name</label>
          <input
            className="save-modal-input"
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Get User Profile"
            value={name}
          />
        </div>

        {/* Location */}
        <div className="modal-field">
          <label className="modal-label">Select Location</label>
          <div className="save-modal-tree-box">
            {collections.map(col => (
              <div className="save-modal-col-group" key={col.id}>
                <Button
                  className={cn(
                    'save-modal-col-btn',
                    isColSelected(col.id) && 'is-selected'
                  )}
                  onClick={() => setSelectedLocation({ colId: col.id })}
                  variant="ghost"
                >
                  <FolderTree
                    className={cn(
                      'save-modal-icon',
                      isColSelected(col.id) && 'is-active'
                    )}
                    size={14}
                  />
                  <span className="save-modal-col-name">{col.name}</span>
                </Button>

                <CollectionTree
                  items={col.items}
                  onSelect={item =>
                    setSelectedLocation({ colId: col.id, folderId: item.id })
                  }
                  selectedId={selectedLocation?.folderId}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button
            disabled={!selectedLocation}
            onClick={handleSave}
            variant="primary"
          >
            Save Request
          </Button>
        </div>
      </div>
    </Modal>
  )
}
