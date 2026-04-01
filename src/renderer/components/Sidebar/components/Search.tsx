import { Search as SearchIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function Search({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: SearchProps) {
  return (
    <div className={cn('sidebar-search-container', className)}>
      <div className="sidebar-search-wrapper">
        <SearchIcon className="sidebar-search-icon" size={14} />
        <input
          className="sidebar-search-input"
          id="sidebar-search-input"
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          type="text"
          value={value}
        />
        {value && (
          <button
            aria-label="Clear search"
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
