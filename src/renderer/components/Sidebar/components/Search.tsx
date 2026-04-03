import { Search as SearchIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

interface SearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function Search({
  value,
  onChange,
  placeholder,
  className,
}: SearchProps) {
  const { t } = useTranslation()
  const displayPlaceholder = placeholder || t('sidebar.search')
  return (
    <div className={cn('sidebar-search-container', className)}>
      <div className="sidebar-search-wrapper">
        <SearchIcon className="sidebar-search-icon" size={14} />
        <input
          className="sidebar-search-input"
          id="sidebar-search-input"
          onChange={e => onChange(e.target.value)}
          placeholder={displayPlaceholder}
          spellCheck={false}
          type="text"
          value={value}
        />
        {value && (
          <button
            aria-label={t('common.clear_search') || 'Clear search'}
            className="sidebar-search-clear"
            onClick={() => onChange('')}
            type="button"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
