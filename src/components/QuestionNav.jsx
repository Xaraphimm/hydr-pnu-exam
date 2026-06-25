import { cn } from '@/lib/utils'

export default function QuestionNav({ questions, answers, currentIndex, flagged, onGoTo }) {
  return (
    <details className="group mt-4 rounded-lg border bg-card shadow-sm">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium select-none">
        Question Navigator {flagged.size > 0 && `(${flagged.size} flagged)`}
      </summary>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-1.5 border-t p-3">
        {questions.map((q, i) => {
          const isAnswered = answers[q.id] !== undefined
          const isCorrect = answers[q.id] === q.c
          const isCurrent = i === currentIndex
          const isFlagged = flagged.has(q.id)

          return (
            <button
              key={i}
              onClick={() => onGoTo(i)}
              className={cn(
                'relative flex h-9 cursor-pointer items-center justify-center rounded-md border text-xs font-medium tabular-nums transition-colors',
                isCurrent && 'border-primary ring-2 ring-primary/40',
                !isCurrent && isAnswered && isCorrect && 'border-transparent bg-success text-success-foreground',
                !isCurrent && isAnswered && !isCorrect && 'border-transparent bg-destructive text-destructive-foreground',
                !isCurrent && !isAnswered && 'bg-muted text-muted-foreground hover:bg-accent',
              )}
            >
              {i + 1}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </details>
  )
}
