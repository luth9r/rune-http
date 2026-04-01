import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'icon'
    | 'ghost-danger'
    | 'danger'
    | 'tab'
    | 'link'
  size?: 'default' | 'sm' | 'lg' | 'xs' | 'icon'
  active?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'default', active, ...props },
    ref
  ) => {
    return (
      <button
        className={cn(
          'btn-base',
          `btn-${variant}`,
          `btn-size-${size}`,
          { 'is-active': active },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
export { Button }
