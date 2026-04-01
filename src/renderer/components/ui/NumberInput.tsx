import type React from 'react'
import { useRef } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import './number-input.css'

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  size?: 'default' | 'sm'
  className?: string
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit,
  size = 'default',
  className,
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const adjust = (delta: number) => {
    let newValue = value + delta
    // Round to precision to avoid floating point issues
    const stepStr = step.toString()
    const precision =
      stepStr.indexOf('.') !== -1 ? stepStr.split('.')[1].length : 0
    newValue = Number(newValue.toFixed(precision))

    if (newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    if (!Number.isNaN(val)) {
      const stepStr = step.toString()
      const precision =
        stepStr.indexOf('.') !== -1 ? stepStr.split('.')[1].length : 0
      onChange(Number(val.toFixed(precision)))
    }
  }

  const isSm = size === 'sm'

  return (
    <div className={cn('number-input-group', isSm && 'is-sm', className)}>
      <button
        className={cn('number-input-btn border-right', isSm && 'is-sm')}
        disabled={value <= min}
        onClick={() => adjust(-step)}
        type="button"
      >
        <Minus size={isSm ? 12 : 14} />
      </button>

      <div className={cn('number-input-wrap', isSm && 'is-sm')}>
        <input
          className={cn('number-input hide-spinners', isSm && 'is-sm')}
          onChange={handleInputChange}
          ref={inputRef}
          type="number"
          value={value}
        />
        {unit && (
          <span className={cn('number-input-unit', isSm && 'is-sm')}>
            {unit}
          </span>
        )}
      </div>

      <button
        className={cn('number-input-btn border-left', isSm && 'is-sm')}
        disabled={value >= max}
        onClick={() => adjust(step)}
        type="button"
      >
        <Plus size={isSm ? 12 : 14} />
      </button>
    </div>
  )
}
