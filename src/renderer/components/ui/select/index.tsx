import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from 'renderer/lib/utils'
import './select.css'

export interface SelectOption<T extends string = string> {
  label: string
  value: T
  color?: string
  style?: React.CSSProperties
}

interface SelectProps<T extends string = string> {
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  className?: string
  variant?: 'default' | 'method'
}

export function Select<T extends string = string>({
  value,
  options,
  onChange,
  className,
  variant = 'default',
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={cn('sel', `sel--${variant}`, className)} ref={ref}>
      <div aria-hidden className="sel__sizer">
        {
          options.reduce((a, b) => (a.label.length > b.label.length ? a : b))
            .label
        }
        <ChevronDown size={12} />
      </div>

      <button
        className={cn('sel__trigger', isOpen && 'open')}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span style={{ color: selected?.color, ...selected?.style }}>
          {selected?.label ?? value}
        </span>
        <ChevronDown
          className={cn('sel__chevron', isOpen && 'open')}
          size={12}
        />
      </button>

      {isOpen && (
        <div className="sel__dropdown">
          {options.map(opt => (
            <button
              className={cn('sel__option', opt.value === value && 'active')}
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
              style={{ color: opt.color, ...opt.style }}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
