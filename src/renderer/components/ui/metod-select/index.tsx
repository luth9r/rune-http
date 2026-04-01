import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HttpMethod } from '@/types'
import './method-select.css'

const METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]

interface MethodSelectProps {
  value: HttpMethod
  onChange: (method: HttpMethod) => void
}

export function MethodSelect({ value, onChange }: MethodSelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="method-select">
      <button
        className={cn('method-select__trigger', open && 'open')}
        onClick={() => setOpen(!open)}
      >
        <span className="method-select__value" data-method={value}>
          {value}
        </span>
        <ChevronDown
          className={cn('method-select__chevron', open && 'open')}
          size={12}
        />
      </button>

      {open && (
        <>
          <div
            className="method-select__backdrop"
            onClick={() => setOpen(false)}
          />
          <div className="method-select__dropdown">
            {METHODS.map(method => (
              <button
                className="method-select__option"
                data-method={method}
                key={method}
                onClick={() => {
                  onChange(method)
                  setOpen(false)
                }}
              >
                {method}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
