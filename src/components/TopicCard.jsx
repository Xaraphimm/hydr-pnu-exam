import { ChevronRight } from 'lucide-react'
import ProgressBarMulti from './ProgressBarMulti.jsx'
import { getMasteryColor } from '../utils/mastery.js'
import { masteryText, masteryBorder } from '@/lib/ui.js'
import { cn } from '@/lib/utils'

export default function TopicCard({ topic, mastery, counts, questionCount, hasQuestionData, onClick }) {
  const hasAttempts = counts.mastered + counts.learning > 0
  const colorKey = getMasteryColor(mastery, hasAttempts)
  const availabilityLabel = hasQuestionData
    ? `${questionCount} question${questionCount === 1 ? '' : 's'}`
    : 'Study content pending'

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 rounded-lg border border-l-4 bg-card p-3.5 text-left shadow-sm transition-colors hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        masteryBorder[colorKey],
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="truncate text-sm font-medium">{topic.name}</span>
        <span className="text-xs text-muted-foreground">{availabilityLabel}</span>
        <ProgressBarMulti
          mastered={counts.mastered}
          learning={counts.learning}
          total={counts.mastered + counts.learning + counts.new}
        />
      </div>
      <span className={cn('text-sm font-semibold tabular-nums', masteryText[colorKey])}>
        {hasAttempts ? `${mastery}%` : '--'}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}
