import { Screen } from './Screen.jsx'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function FlashcardComplete({ results, onStudyMissed, onDone }) {
  const gotIt = results.filter(r => r.gotIt)
  const missed = results.filter(r => !r.gotIt)
  const total = results.length || 1

  return (
    <Screen>
      <div className="flex items-center justify-center gap-3 py-4 text-center text-lg font-semibold">
        <span className="text-success">{gotIt.length} Got It</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-destructive">{missed.length} Missed</span>
      </div>

      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-success" style={{ width: `${(gotIt.length / total) * 100}%` }} />
        <div className="h-full bg-destructive" style={{ width: `${(missed.length / total) * 100}%` }} />
      </div>

      {missed.length > 0 && (
        <div className="mt-6">
          <span className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground">
            MISSED CARDS ({missed.length})
          </span>
          <div className="grid gap-2.5">
            {missed.map(r => (
              <Card key={r.question.id} className="gap-1 p-3.5">
                <div className="text-sm font-medium">{r.question.q}</div>
                <div className="text-sm text-success">{r.question.a[r.question.c]}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-2.5">
        {missed.length > 0 && (
          <Button onClick={() => onStudyMissed(missed.map(r => r.question))}>
            Study Missed Cards
          </Button>
        )}
        <Button variant="outline" onClick={onDone}>Done</Button>
      </div>
    </Screen>
  )
}
