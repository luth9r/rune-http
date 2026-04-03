import { Database, Settings, Globe, FolderTree } from 'lucide-react'
import { Button } from '../ui/button'
import { useTranslation } from '@/i18n'
import './activity-bar.css'

interface ActivityBarProps {
  currentView: string
  setView: (view: string) => void
}

export function ActivityBar({ currentView, setView }: ActivityBarProps) {
  const { t } = useTranslation()
  return (
    <aside className="activity-bar">
      <div className="activity-bar-top">
        <Button
          active={currentView === 'explorer'}
          className="activity-btn"
          onClick={() => setView('explorer')}
          title={t('activity.explorer') || 'Collections'}
          variant="tab"
        >
          <FolderTree size={20} />
        </Button>

        <Button
          active={currentView === 'env'}
          className="activity-btn"
          onClick={() => setView('env')}
          title={t('activity.env') || 'Environments'}
          variant="tab"
        >
          <Globe size={20} />
        </Button>

        <Button
          active={currentView === 'database'}
          className="activity-btn"
          onClick={() => setView('database')}
          title={t('activity.database') || 'Storage'}
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
          title={t('settings.title')}
          variant="tab"
        >
          <Settings size={20} />
        </Button>
      </div>
    </aside>
  )
}
