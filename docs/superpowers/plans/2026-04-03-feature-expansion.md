# Feature Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six features to the exam app: progress persistence, study mode, weak area focus, exam history dashboard, share results, and PWA/offline support.

**Architecture:** A new `HistoryContext` (same pattern as `ThemeContext`) provides localStorage-backed persistence for all history-dependent features. Study mode and weak area focus reuse the existing `ExamScreen` with a `mode` prop. A new `HistoryScreen` component renders the dashboard. Share uses Web Share API with clipboard fallback. PWA uses `vite-plugin-pwa`.

**Tech Stack:** React 19, Vite 8, vite-plugin-pwa, CSS custom properties, localStorage

---

## File Map

```
src/
├── App.jsx                         — MODIFY: add mode state, startStudy, startWeakDrill, history screen routing
├── HistoryContext.jsx               — CREATE: localStorage-backed context for attempts + question stats
├── main.jsx                        — MODIFY: wrap App with HistoryProvider
├── components/
│   ├── HomeScreen.jsx              — MODIFY: tappable sections, weak drill button, history button
│   ├── HomeScreen.css              — MODIFY: styles for tappable sections, new buttons
│   ├── ExamScreen.jsx              — MODIFY: accept mode prop, show study badge
│   ├── ExamScreen.css              — MODIFY: study badge style
│   ├── ResultsScreen.jsx           — MODIFY: save to history, share button, mode badge
│   ├── ResultsScreen.css           — MODIFY: share button styles
│   ├── HistoryScreen.jsx           — CREATE: dashboard with stats, trend chart, attempt list
│   └── HistoryScreen.css           — CREATE: dashboard styles
├── components/TrendChart.jsx       — CREATE: SVG line chart component
├── components/TrendChart.css       — CREATE: chart styles
index.html                          — MODIFY: add manifest link, theme-color meta
vite.config.js                      — MODIFY: add VitePWA plugin
public/
├── manifest.json                   — CREATE: PWA manifest
├── icon-192.png                    — CREATE: PWA icon
└── icon-512.png                    — CREATE: PWA icon
```

---

## Task 1: Progress Persistence (HistoryContext)

**Files:**
- Create: `src/HistoryContext.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: Create HistoryContext**

Create `src/HistoryContext.jsx`:

```jsx
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
  return useContext(HistoryContext)
}
```

- [ ] **Step 2: Wrap App with HistoryProvider**

Modify `src/main.jsx`. Current content:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Replace with:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HistoryProvider } from './HistoryContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HistoryProvider>
      <App />
    </HistoryProvider>
  </StrictMode>,
)
```

- [ ] **Step 3: Verify the app still builds**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/HistoryContext.jsx src/main.jsx
git commit -m "feat: add HistoryContext with localStorage-backed persistence"
```

---

## Task 2: Wire History Saving into Results

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/ResultsScreen.jsx`

- [ ] **Step 1: Add mode state to App and pass to children**

In `src/App.jsx`, add a `mode` state and thread it through. Replace the entire file with:

```jsx
import { useState } from 'react'
import { ThemeProvider } from './ThemeContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import ExamScreen from './components/ExamScreen.jsx'
import ResultsScreen from './components/ResultsScreen.jsx'
import { questions, SECTIONS } from './data/questions.js'
import './styles/reset.css'
import './styles/theme.css'
import './styles/global.css'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [examQuestions, setExamQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState(new Set())
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [reviewIndex, setReviewIndex] = useState(null)
  const [mode, setMode] = useState('exam')
  const [studySection, setStudySection] = useState(null)

  const beginSession = (questionSet, sessionMode, sectionKey = null) => {
    setExamQuestions(shuffle(questionSet))
    setAnswers({})
    setFlagged(new Set())
    setStartTime(Date.now())
    setEndTime(null)
    setReviewIndex(null)
    setMode(sessionMode)
    setStudySection(sectionKey)
    setScreen('exam')
  }

  const startExam = () => beginSession(questions, 'exam')

  const startStudy = (sectionKey) => {
    const filtered = questions.filter(q => q.section === sectionKey)
    beginSession(filtered, 'study', sectionKey)
  }

  const startWeakDrill = (weakQuestions) => {
    beginSession(weakQuestions, 'weak')
  }

  const handleAnswer = (qId, answerIndex) => {
    setAnswers(prev => ({ ...prev, [qId]: answerIndex }))
  }

  const handleToggleFlag = (qId) => {
    setFlagged(prev => {
      const next = new Set(prev)
      next.has(qId) ? next.delete(qId) : next.add(qId)
      return next
    })
  }

  const finishExam = () => {
    setEndTime(Date.now())
    setScreen('results')
  }

  const goToQuestion = (examIndex) => {
    setReviewIndex(examIndex)
    setScreen('exam')
  }

  return (
    <ThemeProvider>
      <ThemeToggle />
      <div className="container">
        {screen === 'home' && (
          <HomeScreen
            onStart={startExam}
            onStudy={startStudy}
            onWeakDrill={startWeakDrill}
            onHistory={() => setScreen('history')}
          />
        )}
        {screen === 'exam' && (
          <ExamScreen
            questions={examQuestions}
            answers={answers}
            flagged={flagged}
            startTime={startTime}
            onAnswer={handleAnswer}
            onToggleFlag={handleToggleFlag}
            onFinish={finishExam}
            initialIndex={reviewIndex}
            mode={mode}
            studySection={studySection}
          />
        )}
        {screen === 'results' && (
          <ResultsScreen
            questions={examQuestions}
            answers={answers}
            startTime={startTime}
            endTime={endTime}
            onRetake={startExam}
            onHome={() => setScreen('home')}
            onGoToQuestion={goToQuestion}
            mode={mode}
            studySection={studySection}
          />
        )}
        {screen === 'history' && (
          <div>History screen placeholder</div>
        )}
      </div>
    </ThemeProvider>
  )
}
```

- [ ] **Step 2: Save attempt on results mount and show mode badge**

Replace `src/components/ResultsScreen.jsx` with:

```jsx
import { useEffect, useRef } from 'react'
import { SECTIONS } from '../data/questions.js'
import { useHistory } from '../HistoryContext.jsx'
import logo from '../assets/phnx-logo.jpeg'
import './ResultsScreen.css'

export default function ResultsScreen({
  questions,
  answers,
  startTime,
  endTime,
  onRetake,
  onHome,
  onGoToQuestion,
  mode,
  studySection,
}) {
  const { saveAttempt } = useHistory()
  const savedRef = useRef(false)

  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.c ? 1 : 0), 0)
  const pct = Math.round((score / questions.length) * 100)
  const passed = pct >= 70
  const elapsed = Math.floor((endTime - startTime) / 1000)

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  const sectionScores = SECTIONS.map(s => {
    const qs = questions.filter(q => q.section === s.key)
    const correct = qs.filter(q => answers[q.id] === q.c).length
    return { ...s, total: qs.length, correct, pct: qs.length ? Math.round((correct / qs.length) * 100) : 0 }
  }).filter(s => s.total > 0)

  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true
    saveAttempt({
      mode,
      section: studySection,
      questions,
      answers,
      startTime,
      endTime,
      sectionScores: sectionScores.map(s => ({ key: s.key, correct: s.correct, total: s.total })),
    })
  }, [])

  const missed = questions
    .map((q, i) => ({ ...q, examIndex: i }))
    .filter(q => answers[q.id] !== q.c)

  const modeLabel = mode === 'study'
    ? `Study: ${SECTIONS.find(s => s.key === studySection)?.name ?? ''}`
    : mode === 'weak' ? 'Weak Areas' : null

  return (
    <div className="results">
      <div className="results-score">
        {modeLabel && <div className="results-mode-badge">{modeLabel}</div>}
        <div className={`results-pct ${passed ? 'results-pct--pass' : 'results-pct--fail'}`}>
          {pct}%
        </div>
        <div className={`results-verdict ${passed ? 'results-verdict--pass' : 'results-verdict--fail'}`}>
          {passed ? 'PASSED' : 'NOT YET'}
        </div>
        <div className="results-detail">
          {score} / {questions.length} correct in {formatTime(elapsed)}
        </div>
      </div>

      <div className="results-card">
        <span className="results-card-label">SECTION BREAKDOWN</span>
        {sectionScores.map(s => (
          <div key={s.key} className="results-section">
            <div className="results-section-header">
              <span className="results-section-name">{s.name}</span>
              <span className={`results-section-score ${s.pct >= 70 ? 'results-section-score--pass' : 'results-section-score--fail'}`}>
                {s.correct}/{s.total} ({s.pct}%)
              </span>
            </div>
            <div className="results-bar">
              <div
                className={`results-bar-fill ${s.pct >= 70 ? '' : 'results-bar-fill--fail'}`}
                style={{ width: `${s.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {missed.length > 0 && (
        <div className="results-card">
          <span className="results-card-label">MISSED QUESTIONS ({missed.length})</span>
          <div className="results-missed">
            {missed.map(mq => (
              <button
                key={mq.id}
                className="results-missed-item"
                onClick={() => onGoToQuestion(mq.examIndex)}
              >
                <div className="results-missed-qid">Q{mq.examIndex + 1} (#{mq.id})</div>
                <div className="results-missed-text">{mq.q}</div>
                <div className="results-missed-answers">
                  Your answer: <span className="results-missed-yours">{mq.a[answers[mq.id]] ?? 'Skipped'}</span>
                  {' | '}
                  Correct: <span className="results-missed-correct">{mq.a[mq.c]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="results-actions">
        <button className="results-retake" onClick={onRetake}>RETAKE EXAM</button>
        <button className="results-home" onClick={onHome}>HOME</button>
      </div>

      <div className="results-footer">
        <img src={logo} alt="PHNX Foundries" className="results-footer-logo" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add mode badge CSS**

Add to the end of `src/components/ResultsScreen.css`:

```css
.results-mode-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  background: var(--color-accent-muted);
  border: 1px solid var(--color-accent);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-accent);
  margin-bottom: 12px;
}
```

- [ ] **Step 4: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/components/ResultsScreen.jsx src/components/ResultsScreen.css
git commit -m "feat: wire history saving into results, add mode state to App"
```

---

## Task 3: Study Mode

**Files:**
- Modify: `src/components/HomeScreen.jsx`
- Modify: `src/components/HomeScreen.css`
- Modify: `src/components/ExamScreen.jsx`
- Modify: `src/components/ExamScreen.css`

- [ ] **Step 1: Make section rows tappable on HomeScreen**

Replace `src/components/HomeScreen.jsx` with:

```jsx
import { SECTIONS, questions } from '../data/questions.js'
import { useHistory } from '../HistoryContext.jsx'
import logo from '../assets/phnx-logo.jpeg'
import './HomeScreen.css'

export default function HomeScreen({ onStart, onStudy, onWeakDrill, onHistory }) {
  const { attempts, questionStats } = useHistory()

  return (
    <div className="home">
      <div className="home-logo">
        <img src={logo} alt="PHNX Foundries" />
      </div>

      <div className="home-header">
        <span className="home-label">AMA 214</span>
        <h1 className="home-title">Hydraulics &amp; Pneumatics</h1>
        <p className="home-subtitle">FAA A&amp;P Practice Exam</p>
      </div>

      <div className="home-card">
        <span className="home-card-label">EXAM DETAILS</span>
        <div className="home-stats">
          <div className="home-stat">
            <span className="home-stat-value">{questions.length}</span>
            <span className="home-stat-label">Questions</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-value">70%</span>
            <span className="home-stat-label">Passing Score</span>
          </div>
        </div>
      </div>

      <div className="home-card">
        <span className="home-card-label">SECTIONS</span>
        <span className="home-card-hint">Tap a section to practice</span>
        <div className="home-sections">
          {SECTIONS.map(s => {
            const count = questions.filter(q => q.section === s.key).length
            return (
              <button
                key={s.key}
                className="home-section-row"
                onClick={() => onStudy(s.key)}
              >
                <span className="home-section-name">{s.name}</span>
                <span className="home-section-count">{count} Q</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="home-note">
        Questions are randomized each attempt. Instant feedback after each answer. Flag questions to review later. Visual diagrams on key concepts.
      </div>

      <button className="home-start" onClick={onStart}>
        BEGIN EXAM
      </button>

      {attempts.length > 0 && (
        <button className="home-history" onClick={onHistory}>
          HISTORY
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update HomeScreen CSS for tappable sections and history button**

Replace `src/components/HomeScreen.css` with:

```css
.home {
  padding-bottom: 48px;
}

.home-logo {
  text-align: center;
  margin-bottom: 32px;
}

.home-logo img {
  height: 48px;
  margin: 0 auto;
  object-fit: contain;
}

[data-theme="light"] .home-logo img {
  filter: invert(1);
}

.home-header {
  text-align: center;
  margin-bottom: 32px;
}

.home-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.home-title {
  font-size: 28px;
  font-weight: 800;
  margin-top: 8px;
  color: var(--color-text);
}

.home-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.home-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.home-card-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 1px;
  text-transform: uppercase;
  display: block;
  margin-bottom: 12px;
}

.home-card-hint {
  display: block;
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-top: -8px;
  margin-bottom: 12px;
}

.home-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.home-stat {
  background: var(--color-bg);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.home-stat-value {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: var(--color-accent);
}

.home-stat-label {
  display: block;
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-top: 4px;
}

.home-sections {
  display: flex;
  flex-direction: column;
}

.home-section-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-light);
  width: 100%;
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  text-align: left;
  transition: background 0.15s;
}

.home-section-row:last-child {
  border-bottom: none;
}

.home-section-row:hover {
  background: var(--color-bg-card-hover);
}

.home-section-row:active {
  background: var(--color-accent-muted);
}

.home-section-name {
  font-size: 14px;
  color: var(--color-text);
}

.home-section-count {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.home-note {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 20px;
}

.home-start {
  width: 100%;
  padding: 16px;
  background: var(--color-accent);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  transition: opacity 0.2s;
  margin-bottom: 8px;
}

.home-start:hover {
  opacity: 0.9;
}

.home-weak-drill {
  width: 100%;
  padding: 14px;
  background: var(--color-bg-card);
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: background 0.2s;
  margin-bottom: 8px;
}

.home-weak-drill:hover {
  background: var(--color-accent-muted);
}

.home-history {
  width: 100%;
  padding: 14px;
  background: none;
  color: var(--color-text-tertiary);
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: border-color 0.2s;
}

.home-history:hover {
  border-color: var(--color-border);
}
```

- [ ] **Step 3: Add study mode badge to ExamScreen**

In `src/components/ExamScreen.jsx`, update the component to accept `mode` and `studySection` props and conditionally show a study badge. Replace the full file:

```jsx
import { useState, useEffect, useRef } from 'react'
import { SECTIONS } from '../data/questions.js'
import diagrams from '../diagrams/index.js'
import QuestionNav from './QuestionNav.jsx'
import './ExamScreen.css'

export default function ExamScreen({
  questions,
  answers,
  flagged,
  startTime,
  onAnswer,
  onToggleFlag,
  onFinish,
  initialIndex,
  mode,
  studySection,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const topRef = useRef(null)

  const q = questions[currentIndex]
  const section = SECTIONS.find(s => s.key === q.section)
  const DiagramComponent = q.diagram ? diagrams[q.diagram] : null
  const score = questions.reduce((acc, question) => acc + (answers[question.id] === question.c ? 1 : 0), 0)

  const studySectionName = mode === 'study'
    ? SECTIONS.find(s => s.key === studySection)?.name
    : null

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(t)
  }, [startTime])

  useEffect(() => {
    setShowFeedback(answers[q.id] !== undefined)
  }, [currentIndex, q.id, answers])

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  const selectAnswer = (answerIndex) => {
    if (answers[q.id] !== undefined) return
    onAnswer(q.id, answerIndex)
    setShowFeedback(true)
  }

  const goTo = (idx) => {
    setCurrentIndex(idx)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const next = () => {
    if (currentIndex < questions.length - 1) {
      goTo(currentIndex + 1)
    } else {
      onFinish()
    }
  }

  const prev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1)
  }

  return (
    <div ref={topRef} className="exam">
      <div className="exam-header">
        {mode === 'study' ? (
          <span className="exam-study-badge">STUDY: {studySectionName}</span>
        ) : mode === 'weak' ? (
          <span className="exam-study-badge">WEAK AREAS</span>
        ) : (
          <span className="exam-timer">{formatTime(elapsed)}</span>
        )}
        <span className="exam-progress">Q {currentIndex + 1} / {questions.length}</span>
        <span className="exam-score">{score} correct</span>
      </div>

      <div className="exam-progress-bar">
        <div className="exam-progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      {section && (
        <span className="exam-section-badge">{section.name}</span>
      )}

      <div className="exam-card">
        <div className="exam-card-top">
          <span className="exam-qid">#{q.id}</span>
          <button
            className={`exam-flag ${flagged.has(q.id) ? 'exam-flag--active' : ''}`}
            onClick={() => onToggleFlag(q.id)}
          >
            {flagged.has(q.id) ? '★' : '☆'}
          </button>
        </div>

        <p className="exam-question">{q.q}</p>

        {DiagramComponent && (
          <div className="exam-diagram">
            <DiagramComponent />
          </div>
        )}

        <div className="exam-answers">
          {q.a.map((opt, i) => {
            const isSelected = answers[q.id] === i
            const isCorrect = i === q.c
            const showResult = showFeedback && answers[q.id] !== undefined

            let cls = 'exam-answer'
            if (showResult && isCorrect) cls += ' exam-answer--correct'
            else if (showResult && isSelected && !isCorrect) cls += ' exam-answer--incorrect'
            else if (isSelected && !showResult) cls += ' exam-answer--selected'

            return (
              <button key={i} className={cls} onClick={() => selectAnswer(i)} disabled={showResult}>
                <span className="exam-answer-indicator">
                  {showResult && isCorrect && '✓'}
                  {showResult && isSelected && !isCorrect && '✗'}
                </span>
                <span className="exam-answer-text">{String.fromCharCode(65 + i)}. {opt}</span>
              </button>
            )
          })}
        </div>

        {showFeedback && answers[q.id] !== undefined && (
          <div className={`exam-explanation ${answers[q.id] === q.c ? 'exam-explanation--correct' : 'exam-explanation--incorrect'}`}>
            <div className="exam-explanation-label">
              {answers[q.id] === q.c ? 'Correct' : 'Incorrect'}
            </div>
            <div className="exam-explanation-text">{q.exp}</div>
          </div>
        )}
      </div>

      <div className="exam-nav">
        <button className="exam-nav-prev" onClick={prev} disabled={currentIndex === 0}>← PREV</button>
        <button className={`exam-nav-next ${showFeedback ? 'exam-nav-next--ready' : ''}`} onClick={next}>
          {currentIndex === questions.length - 1 ? 'FINISH' : 'NEXT →'}
        </button>
      </div>

      <QuestionNav questions={questions} answers={answers} currentIndex={currentIndex} flagged={flagged} onGoTo={goTo} />

      <button className="exam-end" onClick={onFinish}>End &amp; View Results</button>
    </div>
  )
}
```

- [ ] **Step 4: Add study badge CSS**

Add to the end of `src/components/ExamScreen.css`:

```css
.exam-study-badge {
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--color-accent-muted);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-accent);
  letter-spacing: 0.5px;
}
```

- [ ] **Step 5: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/HomeScreen.jsx src/components/HomeScreen.css src/components/ExamScreen.jsx src/components/ExamScreen.css
git commit -m "feat: add study mode with section-specific practice"
```

---

## Task 4: Weak Area Focus

**Files:**
- Modify: `src/components/HomeScreen.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Add weak drill button and logic to HomeScreen**

In `src/components/HomeScreen.jsx`, add the weak drill button after the BEGIN EXAM button. Insert this block between the `<button className="home-start">` and the history button:

```jsx
      {attempts.length > 0 && (
        <button className="home-weak-drill" onClick={() => {
          const weak = questions.filter(q => {
            const s = questionStats[q.id]
            if (!s || s.timesAnswered === 0) return false
            return s.timesCorrect / s.timesAnswered < 0.5
          })
          if (weak.length >= 5) {
            onWeakDrill(weak)
          } else {
            // Backfill with least-answered questions
            const sorted = [...questions].sort((a, b) => {
              const sa = questionStats[a.id]?.timesAnswered ?? 0
              const sb = questionStats[b.id]?.timesAnswered ?? 0
              return sa - sb
            })
            const ids = new Set(weak.map(q => q.id))
            const backfilled = [...weak]
            for (const q of sorted) {
              if (backfilled.length >= 20) break
              if (!ids.has(q.id)) {
                backfilled.push(q)
                ids.add(q.id)
              }
            }
            onWeakDrill(backfilled)
          }
        }}>
          {(() => {
            const weakCount = questions.filter(q => {
              const s = questionStats[q.id]
              if (!s || s.timesAnswered === 0) return false
              return s.timesCorrect / s.timesAnswered < 0.5
            }).length
            return weakCount >= 5 ? `DRILL WEAK AREAS (${weakCount})` : 'DRILL LEAST PRACTICED'
          })()}
        </button>
      )}
```

The full HomeScreen.jsx after this change — insert the block above between the `home-start` button closing tag and the `{attempts.length > 0 && (` history button block.

- [ ] **Step 2: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/HomeScreen.jsx
git commit -m "feat: add weak area focus with auto-generated drill sets"
```

---

## Task 5: Exam History Dashboard

**Files:**
- Create: `src/components/TrendChart.jsx`
- Create: `src/components/TrendChart.css`
- Create: `src/components/HistoryScreen.jsx`
- Create: `src/components/HistoryScreen.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create TrendChart component**

Create `src/components/TrendChart.jsx`:

```jsx
import './TrendChart.css'

export default function TrendChart({ attempts }) {
  // Only show full exam attempts, oldest first
  const examAttempts = [...attempts]
    .filter(a => a.mode === 'exam')
    .reverse()

  if (examAttempts.length < 2) return null

  const W = 320
  const H = 160
  const PAD_L = 36
  const PAD_R = 12
  const PAD_T = 12
  const PAD_B = 28

  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B

  const points = examAttempts.map((a, i) => {
    const x = PAD_L + (i / (examAttempts.length - 1)) * chartW
    const pct = Math.round((a.score / a.total) * 100)
    const y = PAD_T + chartH - (pct / 100) * chartH
    return { x, y, pct }
  })

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  // 70% threshold line
  const threshY = PAD_T + chartH - (70 / 100) * chartH

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="trend-chart-svg">
        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map(v => {
          const y = PAD_T + chartH - (v / 100) * chartH
          return (
            <text key={v} x={PAD_L - 6} y={y + 4} className="trend-chart-label" textAnchor="end">
              {v}%
            </text>
          )
        })}

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => {
          const y = PAD_T + chartH - (v / 100) * chartH
          return (
            <line key={v} x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} className="trend-chart-grid" />
          )
        })}

        {/* 70% threshold */}
        <line x1={PAD_L} y1={threshY} x2={W - PAD_R} y2={threshY} className="trend-chart-threshold" />

        {/* Data line */}
        <polyline points={polyline} className="trend-chart-line" fill="none" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} className="trend-chart-dot" />
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={H - 4} className="trend-chart-label" textAnchor="middle">
            {i + 1}
          </text>
        ))}
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Create TrendChart CSS**

Create `src/components/TrendChart.css`:

```css
.trend-chart {
  margin-bottom: 20px;
}

.trend-chart-svg {
  width: 100%;
  height: auto;
}

.trend-chart-label {
  font-size: 9px;
  fill: var(--color-text-tertiary);
  font-family: 'Inter', sans-serif;
}

.trend-chart-grid {
  stroke: var(--color-border-light);
  stroke-width: 0.5;
}

.trend-chart-threshold {
  stroke: var(--color-accent);
  stroke-width: 1;
  stroke-dasharray: 4 3;
  opacity: 0.5;
}

.trend-chart-line {
  stroke: var(--color-accent);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.trend-chart-dot {
  fill: var(--color-accent);
}
```

- [ ] **Step 3: Create HistoryScreen component**

Create `src/components/HistoryScreen.jsx`:

```jsx
import { SECTIONS } from '../data/questions.js'
import { useHistory } from '../HistoryContext.jsx'
import TrendChart from './TrendChart.jsx'
import './HistoryScreen.css'

export default function HistoryScreen({ onHome }) {
  const { attempts, clearHistory } = useHistory()

  const totalAttempts = attempts.length
  const examAttempts = attempts.filter(a => a.mode === 'exam')
  const bestPct = examAttempts.length
    ? Math.max(...examAttempts.map(a => Math.round((a.score / a.total) * 100)))
    : null
  const avgPct = examAttempts.length
    ? Math.round(examAttempts.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) / examAttempts.length)
    : null
  const totalTime = attempts.reduce((acc, a) => acc + a.elapsed, 0)

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
    if (a.mode === 'study') {
      const sec = SECTIONS.find(s => s.key === a.section)
      return `Study: ${sec?.name ?? a.section}`
    }
    if (a.mode === 'weak') return 'Weak Areas'
    return 'Full Exam'
  }

  const handleClear = () => {
    if (window.confirm('Clear all exam history? This cannot be undone.')) {
      clearHistory()
      onHome()
    }
  }

  return (
    <div className="history">
      <div className="history-header">
        <button className="history-back" onClick={onHome}>← Back</button>
        <h2 className="history-title">Exam History</h2>
      </div>

      <div className="history-card">
        <div className="history-stats">
          <div className="history-stat">
            <span className="history-stat-value">{totalAttempts}</span>
            <span className="history-stat-label">Attempts</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-value">{bestPct !== null ? `${bestPct}%` : '—'}</span>
            <span className="history-stat-label">Best Score</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-value">{avgPct !== null ? `${avgPct}%` : '—'}</span>
            <span className="history-stat-label">Average</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-value">{formatTime(totalTime)}</span>
            <span className="history-stat-label">Study Time</span>
          </div>
        </div>
      </div>

      <TrendChart attempts={attempts} />

      <div className="history-card">
        <span className="history-card-label">ALL ATTEMPTS</span>
        <div className="history-list">
          {attempts.map(a => {
            const pct = Math.round((a.score / a.total) * 100)
            const passed = pct >= 70
            return (
              <div key={a.id} className="history-item">
                <div className="history-item-top">
                  <span className="history-item-date">{formatDate(a.date)}</span>
                  <span className={`history-item-mode history-item-mode--${a.mode}`}>{getModeLabel(a)}</span>
                </div>
                <div className="history-item-bottom">
                  <span className={`history-item-score ${passed ? 'history-item-score--pass' : 'history-item-score--fail'}`}>
                    {pct}%
                  </span>
                  <span className="history-item-detail">
                    {a.score}/{a.total} in {formatTime(a.elapsed)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button className="history-clear" onClick={handleClear}>
        Clear All History
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Create HistoryScreen CSS**

Create `src/components/HistoryScreen.css`:

```css
.history {
  padding-bottom: 48px;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.history-back {
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  font-size: 14px;
  padding: 4px 0;
}

.history-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.history-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.history-card-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 1px;
  text-transform: uppercase;
  display: block;
  margin-bottom: 16px;
}

.history-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.history-stat {
  background: var(--color-bg);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.history-stat-value {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: var(--color-accent);
}

.history-stat-label {
  display: block;
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

.history-list {
  max-height: 500px;
  overflow-y: auto;
}

.history-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.history-item:last-child {
  border-bottom: none;
}

.history-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.history-item-date {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.history-item-mode {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.history-item-mode--exam {
  background: var(--color-accent-muted);
  color: var(--color-accent);
}

.history-item-mode--study {
  background: var(--color-correct-muted);
  color: var(--color-correct);
}

.history-item-mode--weak {
  background: var(--color-incorrect-muted);
  color: var(--color-incorrect);
}

.history-item-bottom {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.history-item-score {
  font-size: 18px;
  font-weight: 700;
}

.history-item-score--pass { color: var(--color-correct); }
.history-item-score--fail { color: var(--color-incorrect); }

.history-item-detail {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.history-clear {
  width: 100%;
  padding: 14px;
  background: none;
  color: var(--color-incorrect);
  border: 1px solid var(--color-incorrect);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.history-clear:hover {
  opacity: 1;
}
```

- [ ] **Step 5: Wire HistoryScreen into App**

In `src/App.jsx`, add the import at the top alongside the other component imports:

```jsx
import HistoryScreen from './components/HistoryScreen.jsx'
```

Then replace the history placeholder in the return JSX:

```jsx
        {screen === 'history' && (
          <div>History screen placeholder</div>
        )}
```

With:

```jsx
        {screen === 'history' && (
          <HistoryScreen onHome={() => setScreen('home')} />
        )}
```

- [ ] **Step 6: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/TrendChart.jsx src/components/TrendChart.css src/components/HistoryScreen.jsx src/components/HistoryScreen.css src/App.jsx
git commit -m "feat: add exam history dashboard with trend chart and attempt list"
```

---

## Task 6: Share Results

**Files:**
- Modify: `src/components/ResultsScreen.jsx`
- Modify: `src/components/ResultsScreen.css`

- [ ] **Step 1: Add share button and logic to ResultsScreen**

In `src/components/ResultsScreen.jsx`, add a `useState` import (it should already have `useEffect` and `useRef` from Task 2). Add this state and function inside the component, after the `modeLabel` variable:

```jsx
  const [shareLabel, setShareLabel] = useState('SHARE')

  const handleShare = async () => {
    const weakest = sectionScores
      .filter(s => s.pct < 100)
      .sort((a, b) => a.pct - b.pct)[0]

    const title = mode === 'study'
      ? `AMA 214: ${SECTIONS.find(s => s.key === studySection)?.name ?? ''} (Study)`
      : 'AMA 214: Hydraulics & Pneumatics'

    let text = `${title}\nScore: ${pct}% (${score}/${questions.length}) — ${passed ? 'PASSED' : 'NOT YET'}\nTime: ${formatTime(elapsed)}`
    if (weakest) text += `\nWeakest: ${weakest.name} (${weakest.pct}%)`
    text += `\nPractice at: ${window.location.origin}${window.location.pathname}`

    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text)
        setShareLabel('COPIED!')
        setTimeout(() => setShareLabel('SHARE'), 2000)
      } catch {}
    }
  }
```

Add the `useState` to the import line at the top:

```jsx
import { useState, useEffect, useRef } from 'react'
```

Then in the results-actions div, add the share button as a third button:

```jsx
      <div className="results-actions">
        <button className="results-retake" onClick={onRetake}>RETAKE EXAM</button>
        <button className="results-share" onClick={handleShare}>{shareLabel}</button>
        <button className="results-home" onClick={onHome}>HOME</button>
      </div>
```

- [ ] **Step 2: Add share button CSS**

Add to `src/components/ResultsScreen.css`, after the `.results-retake:hover` rule:

```css
.results-share {
  flex: 1;
  padding: 14px;
  background: var(--color-bg-card);
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
}

.results-share:hover {
  background: var(--color-accent-muted);
}
```

- [ ] **Step 3: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ResultsScreen.jsx src/components/ResultsScreen.css
git commit -m "feat: add share results with Web Share API and clipboard fallback"
```

---

## Task 7: PWA / Offline Support

**Files:**
- Create: `public/manifest.json`
- Create: `public/icon-192.png`
- Create: `public/icon-512.png`
- Modify: `vite.config.js`
- Modify: `index.html`

- [ ] **Step 1: Install vite-plugin-pwa**

```bash
npm install -D vite-plugin-pwa
```

- [ ] **Step 2: Create PWA icons**

Generate simple orange-on-black icons from the PHNX logo. Since we can't programmatically resize JPEG to PNG in a pure frontend project, create minimal SVG-based icons using a canvas script. Create a one-time Node script, run it, then delete it:

Create `scripts/generate-icons.js`:

```js
import { readFileSync, writeFileSync } from 'fs'

// Create a simple SVG icon with "AMA 214" text on orange background
const createSvgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <rect x="${size * 0.1}" y="${size * 0.1}" width="${size * 0.8}" height="${size * 0.8}" rx="${size * 0.08}" fill="#F97316"/>
  <text x="${size / 2}" y="${size * 0.42}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="${size * 0.14}" fill="#ffffff">AMA</text>
  <text x="${size / 2}" y="${size * 0.62}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="${size * 0.18}" fill="#ffffff">214</text>
</svg>`

writeFileSync('public/icon-192.svg', createSvgIcon(192))
writeFileSync('public/icon-512.svg', createSvgIcon(512))
console.log('Icons generated')
```

Run: `node scripts/generate-icons.js`

Then delete the script: `rm -rf scripts/`

Note: SVG icons work for PWA manifests. If PNG is needed later, they can be converted with any image tool.

- [ ] **Step 3: Create manifest.json**

Create `public/manifest.json`:

```json
{
  "name": "AMA 214: Hydraulics & Pneumatics",
  "short_name": "AMA 214 Exam",
  "description": "FAA A&P Practice Exam for Hydraulics & Pneumatics",
  "start_url": "/hydr-pnu-exam/",
  "scope": "/hydr-pnu-exam/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#F97316",
  "icons": [
    {
      "src": "icon-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "icon-512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ]
}
```

- [ ] **Step 4: Update vite.config.js**

Replace `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon-192.svg', 'icon-512.svg'],
      manifest: false, // Using manual manifest.json in public/
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,jpeg,png,woff2}'],
      },
    }),
  ],
  base: '/hydr-pnu-exam/',
})
```

- [ ] **Step 5: Update index.html**

In `index.html`, add these lines inside `<head>`, after the `<title>` tag:

```html
  <link rel="manifest" href="/hydr-pnu-exam/manifest.json" />
  <meta name="theme-color" content="#F97316" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <link rel="apple-touch-icon" href="/hydr-pnu-exam/icon-192.svg" />
```

- [ ] **Step 6: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds. The `dist/` folder should contain `sw.js` or `workbox-*.js` files.

- [ ] **Step 7: Commit**

```bash
git add public/manifest.json public/icon-192.svg public/icon-512.svg vite.config.js index.html package.json package-lock.json
git commit -m "feat: add PWA support with offline caching and installability"
```

---

## Task 8: Deploy Updated App

**Files:** None (deployment only)

- [ ] **Step 1: Build and deploy**

```bash
npm run deploy
```

This runs `predeploy` (build) then `deploy` (gh-pages push).

- [ ] **Step 2: Push source to origin**

```bash
git push origin master
```

- [ ] **Step 3: Verify live site**

After 1-2 minutes, verify at `https://xaraphimm.github.io/hydr-pnu-exam/`:
- Home screen shows sections as tappable buttons
- Tapping a section starts study mode
- Completing an exam saves to history
- History screen shows attempts and trend chart
- Results screen has a share button
- App can be installed as PWA on mobile

---

## Summary

| Task | What it produces |
|------|-----------------|
| 1 | HistoryContext with localStorage persistence |
| 2 | History saving wired into results, mode state in App |
| 3 | Study mode: tappable sections, study badge in exam |
| 4 | Weak area focus: drill button with auto-generated sets |
| 5 | History dashboard: stats, trend chart, attempt list |
| 6 | Share results: Web Share API + clipboard fallback |
| 7 | PWA: manifest, service worker, offline support |
| 8 | Deploy updated app to GitHub Pages |
