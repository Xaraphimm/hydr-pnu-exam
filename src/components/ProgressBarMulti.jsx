import { cn } from '@/lib/utils'

export default function ProgressBarMulti({ mastered, learning, total, className }) {
  if (total === 0) return null
  const masteredPct = (mastered / total) * 100
  const learningPct = (learning / total) * 100

  return (
    <div className={cn('flex h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}>
      {masteredPct > 0 && (
        <div className="h-full bg-success" style={{ width: `${masteredPct}%` }} />
      )}
      {learningPct > 0 && (
        <div className="h-full bg-primary" style={{ width: `${learningPct}%` }} />
      )}
    </div>
  )
}
