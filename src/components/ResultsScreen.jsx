import { useState, useEffect, useRef } from 'react'
import { TOPICS } from '../data/index.js'
import { useHistory } from '../HistoryContext.jsx'
import { Screen } from './Screen.jsx'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import logo from '../assets/phnx-logo.jpeg'

export default function ResultsScreen({
  questions,
  answers,
  startTime,
  endTime,
  onRetake,
  onHome,
  onGoToQuestion,
  mode,
  topicId,
}) {
  const { saveAttempt, recordAnswer } = useHistory()
  const savedRef = useRef(false)

  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.c ? 1 : 0), 0)
  const pct = Math.round((score / questions.length) * 100)
  const passed = pct >= 70
  const elapsed = Math.floor((endTime - startTime) / 1000)

  const topicName = TOPICS[topicId]?.name

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  const getModeLabel = (m) => {
    if (m === 'all') return 'All Questions'
    if (m === 'weak') return 'Weak Areas'
    if (m === 'mock') return 'Mock Exam'
    return m
  }

  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true
    saveAttempt({ topicId, mode, questions, answers, startTime, endTime })
    questions.forEach((q) => {
      recordAnswer(q.id, answers[q.id] === q.c)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const missed = questions
    .map((q, i) => ({ ...q, examIndex: i }))
    .filter(q => answers[q.id] !== q.c)

  const modeLabel = getModeLabel(mode)

  const [shareLabel, setShareLabel] = useState('Share')

  const handleShare = async () => {
    const title = topicName || 'A&P Exam Practice'

    let text = `${title} (${modeLabel})\nScore: ${pct}% (${score}/${questions.length}) \u2014 ${passed ? 'PASSED' : 'NOT YET'}\nTime: ${formatTime(elapsed)}`
    text += `\nPractice at: ${window.location.origin}${window.location.pathname}`

    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        setShareLabel('Share')
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        setShareLabel('Copied!')
        setTimeout(() => setShareLabel('Share'), 2000)
      } catch {
        setShareLabel('Share')
      }
    }
  }

  return (
    <Screen>
      <div className="flex flex-col items-center gap-1.5 py-4 text-center">
        <Badge variant="secondary">{topicName} &mdash; {modeLabel}</Badge>
        <div className={cn('mt-2 text-5xl font-bold tabular-nums', passed ? 'text-success' : 'text-destructive')}>
          {pct}%
        </div>
        <div className={cn('text-sm font-semibold tracking-wider', passed ? 'text-success' : 'text-destructive')}>
          {passed ? 'PASSED' : 'NOT YET'}
        </div>
        <div className="text-sm text-muted-foreground">
          {score} / {questions.length} correct in {formatTime(elapsed)}
        </div>
      </div>

      <Card className="gap-3 p-4">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground">SCORE BREAKDOWN</span>
        <div className="grid gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Correct</span>
            <span className="font-semibold text-success tabular-nums">{score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Missed</span>
            <span className="font-semibold text-destructive tabular-nums">{missed.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold tabular-nums">{questions.length}</span>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className={cn('h-full rounded-full', passed ? 'bg-success' : 'bg-destructive')} style={{ width: `${pct}%` }} />
        </div>
      </Card>

      {missed.length > 0 && (
        <div className="mt-4">
          <span className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground">
            MISSED QUESTIONS ({missed.length})
          </span>
          <div className="grid gap-2.5">
            {missed.map(mq => (
              <button
                key={mq.id}
                onClick={() => onGoToQuestion(mq.examIndex)}
                className="flex w-full cursor-pointer flex-col gap-1 rounded-lg border bg-card p-3.5 text-left shadow-sm transition-colors hover:bg-accent/50"
              >
                <div className="font-mono text-xs text-muted-foreground">Q{mq.examIndex + 1} (#{mq.id})</div>
                <div className="text-sm font-medium">{mq.q}</div>
                <div className="text-xs text-muted-foreground">
                  Your answer: <span className="text-destructive">{mq.a[answers[mq.id]] ?? 'Skipped'}</span>
                  {' | '}
                  Correct: <span className="text-success">{mq.a[mq.c]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <Button onClick={onRetake}>Retake</Button>
        <Button variant="outline" onClick={handleShare}>{shareLabel}</Button>
        <Button variant="secondary" onClick={onHome}>Home</Button>
      </div>

      <div className="mt-8 flex justify-center opacity-60">
        <img src={logo} alt="PHNX Foundries" className="size-10 rounded-md object-cover" />
      </div>
    </Screen>
  )
}
