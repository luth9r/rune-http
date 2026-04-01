import { Database, Settings, Globe, FolderTree } from 'lucide-react'
import { Button } from '../ui/button'
import './activity-bar.css'

export function ActivityBar({ currentView, setView }) {
  return (
    <aside className="activity-bar">
      <div className="activity-bar-top">
        <Button
          active={currentView === 'explorer'}
          className="activity-btn"
          onClick={() => setView('explorer')}
          variant="tab"
        >
          <FolderTree size={20} />
        </Button>

        <Button
          active={currentView === 'env'}
          className="activity-btn"
          onClick={() => setView('env')}
          variant="tab"
        >
          <Globe size={20} />
        </Button>

        <Button
          active={currentView === 'database'}
          className="activity-btn"
          onClick={() => setView('database')}
          variant="tab"
        >
          <Database size={20} />
        </Button>
      </div>

      <div className="activity-bar-bottom">
        <Button
          active={currentView === 'settings'}
          className="activity-btn"
          onClick={() => setView('settings')}
          variant="tab"
        >
          <Settings size={20} />
        </Button>
      </div>
    </aside>
  )
}
