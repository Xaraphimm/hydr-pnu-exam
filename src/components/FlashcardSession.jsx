import { useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { TOPICS } from '../data/index.js'
import { useHistory } from '../HistoryContext.jsx'
import diagrams from '../diagrams/index.js'
import { Screen } from './Screen.jsx'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function FlashcardSession({ questions, topicId, onFinish, onBack }) {
  const { recordAnswer, toggleQuestionBookmark, isQuestionBookmarked } = useHistory()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState([])

  const q = questions[currentIndex]
  const DiagramComponent = q.diagram ? diagrams[q.diagram] : null
  const topicName = TOPICS[topicId]?.name ?? 'All Questions'
  const bookmarked = isQuestionBookmarked(q.id)

  const handleFlip = () => {
    if (!flipped) setFlipped(true)
  }

  const handleGrade = (gotIt) => {
    recordAnswer(q.id, gotIt)
    const updated = [...results, { question: q, gotIt }]

    if (currentIndex < questions.length - 1) {
      setResults(updated)
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    } else {
      onFinish(updated)
    }
  }

  return (
    <Screen>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 text-muted-foreground">
          &larr; Back
        </Button>
        <span className="text-sm text-muted-foreground tabular-nums">Card {currentIndex + 1} / {questions.length}</span>
        <Badge variant="secondary" className="max-w-[40%] truncate">{topicName}</Badge>
      </div>

      <div
        role="button"
        tabIndex={flipped ? -1 : 0}
        onClick={handleFlip}
        onKeyDown={(e) => {
          if (!flipped && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            handleFlip()
          }
        }}
        aria-label={flipped ? undefined : 'Reveal answer'}
        className="block w-full rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <Card className={cn('min-h-[18rem] justify-center gap-4 p-6 text-center', !flipped && 'cursor-pointer')}>
          {!flipped ? (
            <>
              <p className="text-lg leading-relaxed font-medium">{q.q}</p>
              {DiagramComponent && (
                <div className="overflow-x-auto rounded-lg border bg-muted/40 p-3">
                  <DiagramComponent />
                </div>
              )}
              <span className="text-sm text-muted-foreground">Tap to reveal answer</span>
            </>
          ) : (
            <>
              <div className="text-xl font-semibold text-success">{q.a[q.c]}</div>
              <div className="text-sm leading-relaxed text-muted-foreground">{q.exp}</div>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleQuestionBookmark(q.id)}
                >
                  {bookmarked ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                  {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      {flipped && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="success" onClick={() => handleGrade(true)}>Got it</Button>
          <Button variant="destructive" onClick={() => handleGrade(false)}>Missed it</Button>
        </div>
      )}
    </Screen>
  )
}
