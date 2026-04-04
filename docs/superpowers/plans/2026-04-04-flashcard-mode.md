# Flashcard Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a flashcard study mode with a persistent bottom tab bar, card flip animation, self-grading, and missed-card study decks.

**Architecture:** A top-level `tab` state in App.jsx switches between the existing exam flow and a new flashcard flow. Both flows render simultaneously (hidden via `display: none`) to preserve state when switching tabs. Flashcard grading feeds into the existing `questionStats` in HistoryContext via a new `recordFlashcard()` function.

**Tech Stack:** React 19, CSS 3D transforms (card flip), inline SVG (tab icons), existing CSS custom properties

---

## File Map

```
src/
├── App.jsx                         — MODIFY: add tab state, render both flows + TabBar
├── HistoryContext.jsx               — MODIFY: add recordFlashcard() function
├── styles/global.css                — MODIFY: add bottom padding for tab bar
├── components/
│   ├── TabBar.jsx                  — CREATE: bottom tab bar with two tabs
│   ├── TabBar.css                  — CREATE: fixed-bottom styles, active state
│   ├── FlashcardHome.jsx           — CREATE: section picker with mastery indicators
│   ├── FlashcardHome.css           — CREATE: section list styles
│   ├── FlashcardSession.jsx        — CREATE: card flip, grading, progression
│   ├── FlashcardSession.css        — CREATE: 3D flip animation, card styles
│   ├── FlashcardComplete.jsx       — CREATE: session results, missed list, study-missed
│   └── FlashcardComplete.css       — CREATE: complete screen styles
```

---

## Task 1: Add `recordFlashcard` to HistoryContext

**Files:**
- Modify: `src/HistoryContext.jsx`

- [ ] **Step 1: Add recordFlashcard function**

In `src/HistoryContext.jsx`, add this function after the `clearHistory` callback (after line 67):

```jsx
  const recordFlashcard = useCallback((questionId, gotIt) => {
    setQuestionStats(prev => {
      const existing = prev[questionId] || { timesAnswered: 0, timesCorrect: 0 }
      const next = {
        ...prev,
        [questionId]: {
          timesAnswered: existing.timesAnswered + 1,
          timesCorrect: existing.timesCorrect + (gotIt ? 1 : 0),
        },
      }
      localStorage.setItem(QSTATS_KEY, JSON.stringify(next))
      return next
    })
  }, [])
```

- [ ] **Step 2: Expose recordFlashcard in the context value**

Change the Provider value (line 70) from:

```jsx
    <HistoryContext.Provider value={{ attempts, questionStats, saveAttempt, clearHistory }}>
```

To:

```jsx
    <HistoryContext.Provider value={{ attempts, questionStats, saveAttempt, clearHistory, recordFlashcard }}>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/HistoryContext.jsx
git commit -m "feat: add recordFlashcard function to HistoryContext"
```

---

## Task 2: TabBar Component

**Files:**
- Create: `src/components/TabBar.jsx`
- Create: `src/components/TabBar.css`

- [ ] **Step 1: Create TabBar component**

Create `src/components/TabBar.jsx`:

```jsx
import './TabBar.css'

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <nav className="tab-bar">
      <button
        className={`tab-bar-item ${activeTab === 'exam' ? 'tab-bar-item--active' : ''}`}
        onClick={() => onTabChange('exam')}
      >
        <svg className="tab-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
        <span className="tab-bar-label">Exam</span>
      </button>
      <button
        className={`tab-bar-item ${activeTab === 'flashcards' ? 'tab-bar-item--active' : ''}`}
        onClick={() => onTabChange('flashcards')}
      >
        <svg className="tab-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="14" rx="2" />
          <rect x="4" y="6" width="20" height="14" rx="2" fill="var(--color-bg)" />
          <path d="M8 13h8" />
          <path d="M8 17h5" />
        </svg>
        <span className="tab-bar-label">Flashcards</span>
      </button>
    </nav>
  )
}
```

- [ ] **Step 2: Create TabBar CSS**

Create `src/components/TabBar.css`:

```css
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  background: var(--color-bg);
  border-top: 1px solid var(--color-border-light);
  z-index: 100;
}

.tab-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  padding: 0;
  min-height: 48px;
  transition: color 0.15s;
}

.tab-bar-item--active {
  color: var(--color-accent);
}

.tab-bar-icon {
  width: 22px;
  height: 22px;
}

.tab-bar-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/TabBar.jsx src/components/TabBar.css
git commit -m "feat: add bottom tab bar component"
```

---

## Task 3: Wire TabBar into App + Bottom Padding

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add tab state and TabBar to App**

Replace `src/App.jsx` entirely with:

```jsx
import { useState } from 'react'
import { ThemeProvider } from './ThemeContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import TabBar from './components/TabBar.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import ExamScreen from './components/ExamScreen.jsx'
import ResultsScreen from './components/ResultsScreen.jsx'
import HistoryScreen from './components/HistoryScreen.jsx'
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
  const [tab, setTab] = useState('exam')

  // Exam tab state
  const [screen, setScreen] = useState('home')
  const [examQuestions, setExamQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState(new Set())
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [reviewIndex, setReviewIndex] = useState(null)
  const [mode, setMode] = useState('exam')
  const [studySection, setStudySection] = useState(null)

  // Flashcard tab state
  const [fcScreen, setFcScreen] = useState('flashcard-home')
  const [fcQuestions, setFcQuestions] = useState([])
  const [fcSection, setFcSection] = useState(null)
  const [fcResults, setFcResults] = useState([])

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

  // Flashcard handlers
  const startFlashcards = (sectionKey) => {
    const filtered = sectionKey
      ? questions.filter(q => q.section === sectionKey)
      : questions
    setFcQuestions(shuffle(filtered))
    setFcSection(sectionKey)
    setFcResults([])
    setFcScreen('flashcard-session')
  }

  const finishFlashcards = (results) => {
    setFcResults(results)
    setFcScreen('flashcard-complete')
  }

  const studyMissedCards = (missedQuestions) => {
    setFcQuestions(shuffle(missedQuestions))
    setFcSection(null)
    setFcResults([])
    setFcScreen('flashcard-session')
  }

  return (
    <ThemeProvider>
      <ThemeToggle />

      <div className="container" style={{ display: tab === 'exam' ? 'block' : 'none' }}>
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
          <HistoryScreen onHome={() => setScreen('home')} />
        )}
      </div>

      <div className="container" style={{ display: tab === 'flashcards' ? 'block' : 'none' }}>
        {fcScreen === 'flashcard-home' && (
          <div>Flashcard home placeholder</div>
        )}
        {fcScreen === 'flashcard-session' && (
          <div>Flashcard session placeholder</div>
        )}
        {fcScreen === 'flashcard-complete' && (
          <div>Flashcard complete placeholder</div>
        )}
      </div>

      <TabBar activeTab={tab} onTabChange={setTab} />
    </ThemeProvider>
  )
}
```

- [ ] **Step 2: Add bottom padding for tab bar**

In `src/styles/global.css`, change the `.container` rule from:

```css
.container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
}
```

To:

```css
.container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: 72px;
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/styles/global.css
git commit -m "feat: wire tab bar into App with exam/flashcard tab routing"
```

---

## Task 4: FlashcardHome Component

**Files:**
- Create: `src/components/FlashcardHome.jsx`
- Create: `src/components/FlashcardHome.css`

- [ ] **Step 1: Create FlashcardHome component**

Create `src/components/FlashcardHome.jsx`:

```jsx
import { SECTIONS, questions } from '../data/questions.js'
import { useHistory } from '../HistoryContext.jsx'
import './FlashcardHome.css'

function getMastered(sectionQuestions, questionStats) {
  return sectionQuestions.filter(q => {
    const s = questionStats[q.id]
    if (!s || s.timesAnswered < 4) return false
    return s.timesCorrect / s.timesAnswered >= 0.75
  }).length
}

export default function FlashcardHome({ onStart }) {
  const { questionStats } = useHistory()

  const allMastered = getMastered(questions, questionStats)
  const hasStats = Object.keys(questionStats).length > 0

  return (
    <div className="fc-home">
      <h2 className="fc-home-title">Flashcards</h2>

      <div className="fc-home-card">
        <button className="fc-home-row" onClick={() => onStart(null)}>
          <div className="fc-home-row-left">
            <span className="fc-home-row-name">All Questions</span>
            <span className="fc-home-row-count">{questions.length} cards</span>
          </div>
          {hasStats && (
            <span className="fc-home-row-mastery">{allMastered}/{questions.length} mastered</span>
          )}
        </button>

        <div className="fc-home-divider" />

        {SECTIONS.map(sec => {
          const sectionQs = questions.filter(q => q.section === sec.key)
          const mastered = getMastered(sectionQs, questionStats)
          return (
            <button key={sec.key} className="fc-home-row" onClick={() => onStart(sec.key)}>
              <div className="fc-home-row-left">
                <span className="fc-home-row-name">{sec.name}</span>
                <span className="fc-home-row-count">{sectionQs.length} cards</span>
              </div>
              {hasStats && (
                <span className="fc-home-row-mastery">{mastered}/{sectionQs.length} mastered</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create FlashcardHome CSS**

Create `src/components/FlashcardHome.css`:

```css
.fc-home {
  padding-bottom: 48px;
}

.fc-home-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 24px;
}

.fc-home-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  overflow: hidden;
}

.fc-home-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 14px 20px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border-light);
  text-align: left;
  transition: background 0.15s;
  min-height: 48px;
}

.fc-home-row:last-child {
  border-bottom: none;
}

.fc-home-row:hover {
  background: var(--color-bg-card-hover);
}

.fc-home-row:active {
  background: var(--color-accent-muted);
}

.fc-home-row-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fc-home-row-name {
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
}

.fc-home-row-count {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.fc-home-row-mastery {
  font-size: 12px;
  color: var(--color-correct);
  font-weight: 600;
}

.fc-home-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0 20px;
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/FlashcardHome.jsx src/components/FlashcardHome.css
git commit -m "feat: add flashcard home screen with section picker and mastery"
```

---

## Task 5: FlashcardSession Component

**Files:**
- Create: `src/components/FlashcardSession.jsx`
- Create: `src/components/FlashcardSession.css`

- [ ] **Step 1: Create FlashcardSession component**

Create `src/components/FlashcardSession.jsx`:

```jsx
import { useState } from 'react'
import { SECTIONS } from '../data/questions.js'
import { useHistory } from '../HistoryContext.jsx'
import diagrams from '../diagrams/index.js'
import './FlashcardSession.css'

export default function FlashcardSession({ questions, sectionKey, onFinish }) {
  const { recordFlashcard } = useHistory()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState([])

  const q = questions[currentIndex]
  const DiagramComponent = q.diagram ? diagrams[q.diagram] : null
  const sectionName = sectionKey
    ? SECTIONS.find(s => s.key === sectionKey)?.name
    : 'All Questions'

  const handleFlip = () => {
    if (!flipped) setFlipped(true)
  }

  const handleGrade = (gotIt) => {
    recordFlashcard(q.id, gotIt)
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
    <div className="fc-session">
      <div className="fc-session-header">
        <span className="fc-session-progress">Card {currentIndex + 1} / {questions.length}</span>
        <span className="fc-session-badge">{sectionName}</span>
      </div>

      <div className="fc-card-container" onClick={handleFlip}>
        <div className={`fc-card ${flipped ? 'fc-card--flipped' : ''}`}>
          <div className="fc-card-front">
            <p className="fc-card-question">{q.q}</p>
            {DiagramComponent && (
              <div className="fc-card-diagram">
                <DiagramComponent />
              </div>
            )}
            <span className="fc-card-hint">Tap to reveal answer</span>
          </div>
          <div className="fc-card-back">
            <div className="fc-card-answer">{q.a[q.c]}</div>
            <div className="fc-card-explanation">{q.exp}</div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="fc-session-actions">
          <button className="fc-session-got-it" onClick={() => handleGrade(true)}>GOT IT</button>
          <button className="fc-session-missed" onClick={() => handleGrade(false)}>MISSED IT</button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create FlashcardSession CSS**

Create `src/components/FlashcardSession.css`:

```css
.fc-session {
  padding-bottom: 48px;
}

.fc-session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.fc-session-progress {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.fc-session-badge {
  padding: 4px 12px;
  border-radius: 4px;
  background: var(--color-accent-muted);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-accent);
}

.fc-card-container {
  perspective: 800px;
  margin-bottom: 20px;
  cursor: pointer;
}

.fc-card {
  position: relative;
  min-height: 280px;
  transition: transform 0.4s ease;
  transform-style: preserve-3d;
}

.fc-card--flipped {
  transform: rotateY(180deg);
}

.fc-card-front,
.fc-card-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 280px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.fc-card-back {
  transform: rotateY(180deg);
}

.fc-card-question {
  font-size: 17px;
  line-height: 1.6;
  color: var(--color-text);
  text-align: center;
}

.fc-card-diagram {
  margin-top: 16px;
}

.fc-card-hint {
  display: block;
  text-align: center;
  margin-top: 16px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.fc-card-answer {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-accent);
  text-align: center;
  margin-bottom: 16px;
}

.fc-card-explanation {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  text-align: center;
}

.fc-session-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fc-session-got-it {
  width: 100%;
  padding: 16px;
  background: var(--color-correct);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  min-height: 48px;
  transition: opacity 0.2s;
}

.fc-session-got-it:hover {
  opacity: 0.9;
}

.fc-session-missed {
  width: 100%;
  padding: 16px;
  background: var(--color-incorrect);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  min-height: 48px;
  transition: opacity 0.2s;
}

.fc-session-missed:hover {
  opacity: 0.9;
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/FlashcardSession.jsx src/components/FlashcardSession.css
git commit -m "feat: add flashcard session with card flip and grading"
```

---

## Task 6: FlashcardComplete Component

**Files:**
- Create: `src/components/FlashcardComplete.jsx`
- Create: `src/components/FlashcardComplete.css`

- [ ] **Step 1: Create FlashcardComplete component**

Create `src/components/FlashcardComplete.jsx`:

```jsx
import './FlashcardComplete.css'

export default function FlashcardComplete({ results, onStudyMissed, onDone }) {
  const gotIt = results.filter(r => r.gotIt)
  const missed = results.filter(r => !r.gotIt)

  return (
    <div className="fc-complete">
      <div className="fc-complete-score">
        <span className="fc-complete-got-it">{gotIt.length} Got It</span>
        <span className="fc-complete-divider">/</span>
        <span className="fc-complete-missed">{missed.length} Missed</span>
      </div>

      <div className="fc-complete-bar">
        <div
          className="fc-complete-bar-got-it"
          style={{ width: `${(gotIt.length / results.length) * 100}%` }}
        />
        <div
          className="fc-complete-bar-missed"
          style={{ width: `${(missed.length / results.length) * 100}%` }}
        />
      </div>

      {missed.length > 0 && (
        <div className="fc-complete-card">
          <span className="fc-complete-card-label">MISSED CARDS ({missed.length})</span>
          <div className="fc-complete-list">
            {missed.map(r => (
              <div key={r.question.id} className="fc-complete-item">
                <div className="fc-complete-item-q">{r.question.q}</div>
                <div className="fc-complete-item-a">{r.question.a[r.question.c]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fc-complete-actions">
        {missed.length > 0 && (
          <button
            className="fc-complete-study-missed"
            onClick={() => onStudyMissed(missed.map(r => r.question))}
          >
            STUDY MISSED CARDS
          </button>
        )}
        <button className="fc-complete-done" onClick={onDone}>DONE</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create FlashcardComplete CSS**

Create `src/components/FlashcardComplete.css`:

```css
.fc-complete {
  padding-bottom: 48px;
}

.fc-complete-score {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
}

.fc-complete-got-it {
  color: var(--color-correct);
}

.fc-complete-divider {
  color: var(--color-text-tertiary);
  margin: 0 8px;
}

.fc-complete-missed {
  color: var(--color-incorrect);
}

.fc-complete-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
  background: var(--color-bg-card);
}

.fc-complete-bar-got-it {
  background: var(--color-correct);
  height: 100%;
}

.fc-complete-bar-missed {
  background: var(--color-incorrect);
  height: 100%;
}

.fc-complete-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.fc-complete-card-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 1px;
  text-transform: uppercase;
  display: block;
  margin-bottom: 16px;
}

.fc-complete-list {
  max-height: 400px;
  overflow-y: auto;
}

.fc-complete-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.fc-complete-item:last-child {
  border-bottom: none;
}

.fc-complete-item-q {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin-bottom: 4px;
}

.fc-complete-item-a {
  font-size: 14px;
  color: var(--color-accent);
  font-weight: 600;
}

.fc-complete-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fc-complete-study-missed {
  width: 100%;
  padding: 16px;
  background: var(--color-accent);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  min-height: 48px;
  transition: opacity 0.2s;
}

.fc-complete-study-missed:hover {
  opacity: 0.9;
}

.fc-complete-done {
  width: 100%;
  padding: 14px;
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  min-height: 48px;
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/FlashcardComplete.jsx src/components/FlashcardComplete.css
git commit -m "feat: add flashcard complete screen with missed cards and study-missed"
```

---

## Task 7: Wire Flashcard Screens into App

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace flashcard placeholders with real components**

In `src/App.jsx`, add the flashcard imports at the top, after the HistoryScreen import:

```jsx
import FlashcardHome from './components/FlashcardHome.jsx'
import FlashcardSession from './components/FlashcardSession.jsx'
import FlashcardComplete from './components/FlashcardComplete.jsx'
```

Then replace the flashcard tab container (the second `<div className="container">` block) from:

```jsx
      <div className="container" style={{ display: tab === 'flashcards' ? 'block' : 'none' }}>
        {fcScreen === 'flashcard-home' && (
          <div>Flashcard home placeholder</div>
        )}
        {fcScreen === 'flashcard-session' && (
          <div>Flashcard session placeholder</div>
        )}
        {fcScreen === 'flashcard-complete' && (
          <div>Flashcard complete placeholder</div>
        )}
      </div>
```

To:

```jsx
      <div className="container" style={{ display: tab === 'flashcards' ? 'block' : 'none' }}>
        {fcScreen === 'flashcard-home' && (
          <FlashcardHome onStart={startFlashcards} />
        )}
        {fcScreen === 'flashcard-session' && (
          <FlashcardSession
            questions={fcQuestions}
            sectionKey={fcSection}
            onFinish={finishFlashcards}
          />
        )}
        {fcScreen === 'flashcard-complete' && (
          <FlashcardComplete
            results={fcResults}
            onStudyMissed={studyMissedCards}
            onDone={() => setFcScreen('flashcard-home')}
          />
        )}
      </div>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire flashcard screens into App tab routing"
```

---

## Task 8: Deploy

**Files:** None (deployment only)

- [ ] **Step 1: Build and deploy**

```bash
npm run deploy
```

- [ ] **Step 2: Push source**

```bash
git push origin master
```

---

## Summary

| Task | What it produces |
|------|-----------------|
| 1 | `recordFlashcard()` function in HistoryContext |
| 2 | TabBar component with exam/flashcard tabs |
| 3 | Tab routing in App.jsx, bottom padding in global.css |
| 4 | FlashcardHome with section picker and mastery indicators |
| 5 | FlashcardSession with card flip, diagrams, and grading |
| 6 | FlashcardComplete with missed cards and study-missed flow |
| 7 | Wire all flashcard screens into App |
| 8 | Deploy to GitHub Pages |
