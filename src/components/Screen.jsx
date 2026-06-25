import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const WIDTHS = {
  default: 'max-w-2xl',
  wide: 'max-w-4xl',
  narrow: 'max-w-xl',
}

export function Screen({ className, width = 'default', children }) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 pt-5 pb-28 sm:px-6 sm:pt-6',
        WIDTHS[width] ?? WIDTHS.default,
        className,
      )}
    >
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle, onBack, actions, className }) {
  return (
    <div className={cn('mb-5 flex items-center gap-3', className)}>
      {onBack && (
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          aria-label="Go back"
          className="shrink-0"
        >
          <ChevronLeft />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
