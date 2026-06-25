const CIRCUMFERENCE = 2 * Math.PI * 15.5

export default function ReadinessRing({ percentage, mastered, total, onClick }) {
  const dashArray = (percentage / 100) * CIRCUMFERENCE
  const remainder = CIRCUMFERENCE - dashArray

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Start all-Airframe study session. ${mastered} of ${total} questions mastered.`}
      className="flex w-full cursor-pointer items-center gap-4 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none sm:p-5"
    >
      <div className="relative flex size-[72px] shrink-0 items-center justify-center">
        <svg viewBox="0 0 36 36" className="size-[72px] -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-muted" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            className="stroke-primary"
            strokeWidth="3"
            strokeDasharray={`${dashArray} ${remainder}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-base font-bold tabular-nums">{percentage}%</span>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-base font-semibold">Exam Readiness</span>
        <span className="text-sm text-muted-foreground">
          {mastered} of {total} questions mastered
        </span>
        <span className="text-xs text-muted-foreground">70% needed to pass</span>
        <span className="mt-1 text-xs font-medium text-primary">
          Tap to study all Airframe questions
        </span>
      </div>
    </button>
  )
}
