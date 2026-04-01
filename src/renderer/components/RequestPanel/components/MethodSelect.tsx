import { Select } from '@/components/ui/select'
import { getMethodColor } from '@/utils/methodColor'
import type { HttpMethod } from '@/types'

const METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]

const METHOD_OPTIONS = METHODS.map(m => ({
  label: m,
  value: m,
  color: getMethodColor(m),
}))

interface MethodSelectProps {
  value: HttpMethod
  onChange: (method: HttpMethod) => void
  className?: string
}

export function MethodSelect({
  value,
  onChange,
  className,
}: MethodSelectProps) {
  return (
    <Select
      className={className}
      onChange={onChange}
      options={METHOD_OPTIONS}
      value={value}
      variant="method"
    />
  )
}
