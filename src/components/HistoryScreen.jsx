import { TOPICS } from '../data/index.js'
import { useHistory } from '../HistoryContext.jsx'
import TrendChart from './TrendChart.jsx'
import { Screen, PageHeader } from './Screen.jsx'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function HistoryScreen({ topicId, onHome }) {
  const { getTopicAttempts, clearHistory } = useHistory()

  const attempts = getTopicAttempts(topicId)
  const topicName = TOPICS[topicId]?.name

  const totalAttempts = attempts.length
  const bestPct = totalAttempts
    ? Math.max(...attempts.map(a => Math.round((a.score / a.total) * 100)))
    : null
  const avgPct = totalAttempts
    ? Math.round(attempts.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) / totalAttempts)
    : null
  const totalTime = attempts.reduce((acc, a) => acc + (a.time || 0), 0)

  const formatTime = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  const formatDate = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getModeLabel = (a) => {
    if (a.mode === 'all') return 'All Questions'
    if (a.mode === 'weak') return 'Weak Areas'
    if (a.mode === 'mock') return 'Mock Exam'
    if (a.mode === 'exam') return 'Full Exam'
    return a.mode
  }

  const handleClear = () => {
    if (window.confirm('Clear all exam history? This cannot be undone.')) {
      clearHistory()
      onHome()
    }
  }

  const stats = [
    ['Attempts', totalAttempts],
    ['Best Score', bestPct !== null ? `${bestPct}%` : '\u2014'],
    ['Average', avgPct !== null ? `${avgPct}%` : '\u2014'],
    ['Study Time', formatTime(totalTime)],
  ]

  return (
    <Screen>
      <PageHeader title={topicName} onBack={onHome} />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <Card key={label} className="items-center gap-0.5 p-3">
            <span className="text-xl font-bold tabular-nums">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <TrendChart attempts={attempts} />
      </div>

      <div className="mt-4">
        <span className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground">ALL ATTEMPTS</span>
        <div className="grid gap-2.5">
          {attempts.length === 0 && (
            <Card className="p-4 text-sm text-muted-foreground">No attempts yet for this topic.</Card>
          )}
          {attempts.map(a => {
            const pct = Math.round((a.score / a.total) * 100)
            const passed = pct >= 70
            return (
              <Card key={a.id} className="gap-2 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{formatDate(a.date)}</span>
                  <Badge variant="muted">{getModeLabel(a)}</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={cn('text-lg font-bold tabular-nums', passed ? 'text-success' : 'text-destructive')}>
                    {pct}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {a.score}/{a.total} in {formatTime(a.time || 0)}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <Button variant="outline" className="mt-5 w-full text-destructive hover:text-destructive" onClick={handleClear}>
        Clear All History
      </Button>
    </Screen>
  )
}
