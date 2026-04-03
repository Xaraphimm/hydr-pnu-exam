import { createContext, useContext, useState, useCallback } from 'react'

const HistoryContext = createContext()

const ATTEMPTS_KEY = 'hydr-pnu-attempts'
const QSTATS_KEY = 'hydr-pnu-qstats'

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function HistoryProvider({ children }) {
  const [attempts, setAttempts] = useState(() => loadJSON(ATTEMPTS_KEY, []))
  const [questionStats, setQuestionStats] = useState(() => loadJSON(QSTATS_KEY, {}))

  const saveAttempt = useCallback(({ mode, section, questions, answers, startTime, endTime, sectionScores }) => {
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.c ? 1 : 0), 0)
    const elapsed = Math.floor((endTime - startTime) / 1000)
    const missedQuestionIds = questions.filter(q => answers[q.id] !== q.c).map(q => q.id)

    const attempt = {
      id: crypto.randomUUID(),
      date: Date.now(),
      mode,
      section: section ?? null,
      score,
      total: questions.length,
      elapsed,
      sectionScores,
      missedQuestionIds,
    }

    setAttempts(prev => {
      const next = [attempt, ...prev]
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(next))
      return next
    })

    setQuestionStats(prev => {
      const next = { ...prev }
      questions.forEach(q => {
        const existing = next[q.id] || { timesAnswered: 0, timesCorrect: 0 }
        if (answers[q.id] !== undefined) {
          next[q.id] = {
            timesAnswered: existing.timesAnswered + 1,
            timesCorrect: existing.timesCorrect + (answers[q.id] === q.c ? 1 : 0),
          }
        }
      })
      localStorage.setItem(QSTATS_KEY, JSON.stringify(next))
      return next
    })

    return attempt
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(ATTEMPTS_KEY)
    localStorage.removeItem(QSTATS_KEY)
    setAttempts([])
    setQuestionStats({})
  }, [])

  return (
    <HistoryContext.Provider value={{ attempts, questionStats, saveAttempt, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const ctx = useContext(HistoryContext)
  if (!ctx) throw new Error('useHistory must be used within a HistoryProvider')
  return ctx
}
