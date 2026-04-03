# AMA 214: Hydraulics & Pneumatics Practice Exam — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first, shareable FAA A&P practice exam site for Hydraulics & Pneumatics, deployed to GitHub Pages.

**Architecture:** Single-page React app with three screens (Home, Exam, Results). All 120+ fill-in-the-blank questions with MCQ answers stored as a static JS data file. 12+ inline SVG diagrams rendered on relevant questions. Dark/light theme via CSS custom properties and React context. Deployed as static files to GitHub Pages via Vite build.

**Tech Stack:** Vite, React 19, CSS custom properties (no framework), GitHub Pages

---

## File Map

```
hydr-pnu-exam/
├── index.html                          — HTML shell, loads Inter font
├── vite.config.js                      — Vite config with base path for GH Pages
├── package.json                        — dependencies and scripts
├── src/
│   ├── main.jsx                        — React entry point, renders <App />
│   ├── App.jsx                         — Theme provider + screen router
│   ├── ThemeContext.jsx                 — React context for dark/light mode
│   ├── styles/
│   │   ├── reset.css                   — Minimal CSS reset
│   │   ├── theme.css                   — CSS custom properties for both themes
│   │   └── global.css                  — Base typography, responsive container, shared styles
│   ├── components/
│   │   ├── ThemeToggle.jsx             — Sun/moon toggle button
│   │   ├── ThemeToggle.css             — Toggle styles
│   │   ├── HomeScreen.jsx              — Landing page with logo, sections, start button
│   │   ├── HomeScreen.css              — Home screen styles
│   │   ├── ExamScreen.jsx              — Question display, answer selection, navigation
│   │   ├── ExamScreen.css              — Exam screen styles
│   │   ├── ResultsScreen.jsx           — Score, section breakdown, missed questions
│   │   ├── ResultsScreen.css           — Results screen styles
│   │   ├── QuestionNav.jsx             — Collapsible grid navigator
│   │   └── QuestionNav.css             — Navigator styles
│   ├── diagrams/
│   │   ├── PascalLaw.jsx               — Dual-cylinder pressure diagram
│   │   ├── OpenCenter.jsx              — Series valve flow path
│   │   ├── ClosedCenter.jsx            — Parallel valve flow path
│   │   ├── DoubleActingActuator.jsx    — Piston, ports, rod
│   │   ├── Reservoir.jsx               — Standpipe + emergency draw
│   │   ├── FilterBypass.jsx            — Filter with bypass valve
│   │   ├── CylinderCalc.jsx            — Circle cross-section + formulas
│   │   ├── PumpTypes.jsx               — Constant vs variable displacement
│   │   ├── SealTypes.jsx               — Packing vs gasket
│   │   ├── Pneudraulics.jsx            — Nitrogen → fluid → actuator
│   │   ├── ViscosityCurve.jsx          — Viscosity vs temperature
│   │   ├── PneumaticBrakeValve.jsx     — Emergency brake valve
│   │   └── index.js                    — Diagram registry (key → component map)
│   ├── data/
│   │   └── questions.js                — All 130+ questions array
│   └── assets/
│       └── phnx-logo.jpeg              — PHNX Foundries logo
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`

- [ ] **Step 1: Initialize the project with Vite**

```bash
cd /Users/xaraphim/Documents/hydr-pnu-exam
npm create vite@latest . -- --template react
```

Select "React" and "JavaScript" if prompted. This creates the scaffold.

- [ ] **Step 2: Clean up Vite defaults**

Delete these generated files that we don't need:
```bash
rm -f src/App.css src/index.css src/assets/react.svg public/vite.svg
```

- [ ] **Step 3: Configure Vite for GitHub Pages**

Replace `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/hydr-pnu-exam/',
})
```

- [ ] **Step 4: Set up index.html**

Replace `index.html` with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AMA 214: Hydraulics & Pneumatics — FAA A&P Practice Exam</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 5: Set up main.jsx**

Replace `src/main.jsx` with:

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

- [ ] **Step 6: Set up minimal App.jsx**

Replace `src/App.jsx` with:

```jsx
export default function App() {
  return <div>App works</div>
}
```

- [ ] **Step 7: Copy PHNX logo into assets**

```bash
mkdir -p src/assets
cp "/Users/xaraphim/Library/Mobile Documents/com~apple~CloudDocs/phnx logo .jpeg" src/assets/phnx-logo.jpeg
```

- [ ] **Step 8: Install dependencies and verify**

```bash
npm install
npm run dev -- --open
```

Verify: Browser opens and shows "App works".

- [ ] **Step 9: Initialize git and commit**

```bash
git init
npx gitignore node  
git add -A
git commit -m "feat: scaffold Vite + React project"
```

---

## Task 2: Theme System (Dark/Light Mode)

**Files:**
- Create: `src/ThemeContext.jsx`
- Create: `src/styles/reset.css`
- Create: `src/styles/theme.css`
- Create: `src/styles/global.css`
- Create: `src/components/ThemeToggle.jsx`
- Create: `src/components/ThemeToggle.css`
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create CSS reset**

Create `src/styles/reset.css`:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

img, svg {
  display: block;
  max-width: 100%;
}

button {
  font: inherit;
  cursor: pointer;
}

input, button, textarea, select {
  font: inherit;
}
```

- [ ] **Step 2: Create theme CSS custom properties**

Create `src/styles/theme.css`:

```css
:root {
  --color-bg: #ffffff;
  --color-bg-card: #f5f5f5;
  --color-bg-card-hover: #ebebeb;
  --color-bg-input: #e8e8e8;
  --color-text: #000000;
  --color-text-secondary: #555555;
  --color-text-tertiary: #888888;
  --color-border: #d0d0d0;
  --color-border-light: #e0e0e0;
  --color-accent: #F97316;
  --color-accent-muted: rgba(249, 115, 22, 0.15);
  --color-correct: #16a34a;
  --color-correct-muted: rgba(22, 163, 74, 0.12);
  --color-incorrect: #dc2626;
  --color-incorrect-muted: rgba(220, 38, 38, 0.12);
  --color-diagram-bg: #f0f0f0;
  --color-diagram-line: #000000;
  --color-diagram-text: #000000;
  --color-diagram-secondary: #666666;
}

[data-theme="dark"] {
  --color-bg: #000000;
  --color-bg-card: #111111;
  --color-bg-card-hover: #1a1a1a;
  --color-bg-input: #1a1a1a;
  --color-text: #ffffff;
  --color-text-secondary: #aaaaaa;
  --color-text-tertiary: #777777;
  --color-border: #333333;
  --color-border-light: #222222;
  --color-accent: #F97316;
  --color-accent-muted: rgba(249, 115, 22, 0.15);
  --color-correct: #22c55e;
  --color-correct-muted: rgba(34, 197, 94, 0.12);
  --color-incorrect: #ef4444;
  --color-incorrect-muted: rgba(239, 68, 68, 0.12);
  --color-diagram-bg: #111111;
  --color-diagram-line: #ffffff;
  --color-diagram-text: #ffffff;
  --color-diagram-secondary: #888888;
}
```

- [ ] **Step 3: Create global styles**

Create `src/styles/global.css`:

```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.2s, color 0.2s;
  line-height: 1.5;
}

.container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
}

@media (min-width: 640px) {
  .container {
    width: 90%;
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 32px;
  }
}
```

- [ ] **Step 4: Create ThemeContext**

Create `src/ThemeContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('phnx-theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('phnx-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
```

- [ ] **Step 5: Create ThemeToggle component**

Create `src/components/ThemeToggle.jsx`:

```jsx
import { useTheme } from '../ThemeContext.jsx'
import './ThemeToggle.css'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}
```

Create `src/components/ThemeToggle.css`:

```css
.theme-toggle {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px;
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background: var(--color-bg-card-hover);
}
```

- [ ] **Step 6: Wire up App.jsx with theme and styles**

Replace `src/App.jsx`:

```jsx
import { ThemeProvider } from './ThemeContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import './styles/reset.css'
import './styles/theme.css'
import './styles/global.css'

export default function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <div className="container">
        <p>Theme system works. Toggle the sun/moon icon.</p>
      </div>
    </ThemeProvider>
  )
}
```

- [ ] **Step 7: Verify in browser**

```bash
npm run dev
```

Verify:
- Page loads with light or dark mode based on system preference
- Clicking the toggle switches between dark (black bg, white text) and light (white bg, black text)
- Refreshing preserves the chosen theme
- Orange accent color (`#F97316`) is available via `var(--color-accent)`

- [ ] **Step 8: Commit**

```bash
git add src/ThemeContext.jsx src/styles/ src/components/ThemeToggle.jsx src/components/ThemeToggle.css src/App.jsx
git commit -m "feat: add dark/light theme system with toggle and CSS custom properties"
```

---

## Task 3: Question Data

**Files:**
- Create: `src/data/questions.js`

This is the largest single task. It produces the full question bank — 130+ fill-in-the-blank questions with MCQ options, correct answer index, explanation, section tag, and optional diagram key.

- [ ] **Step 1: Research and write the question data file**

Create `src/data/questions.js`. The file exports two things: `SECTIONS` (section metadata) and `questions` (the question array).

Questions must be researched against the FAA-H-8083-31 (Aviation Maintenance Technician Handbook — Airframe), Chapters 12 (Hydraulic and Pneumatic Power Systems). Use the user's existing 120 MCQ + 162 fill-in-the-blank answers as reference material but do not just copy them. Rewrite as proper fill-in-the-blank format.

Each question object has this shape:

```js
{
  id: 1,
  section: 'fundamentals',     // matches a SECTIONS key
  q: 'The study of the physical behavior of liquids at rest and in motion is known as ________.',
  a: ['pneumatics', 'hydraulics', 'fluid dynamics'],
  c: 1,                        // index of correct answer in a[]
  exp: 'Hydraulics comes from the Greek word for water and covers all liquid behavior at rest and in motion.',
  diagram: 'pascalLaw',        // optional — key into diagram registry, omit if no diagram
}
```

The `SECTIONS` array:

```js
export const SECTIONS = [
  { key: 'fundamentals', name: 'Hydraulic Fundamentals', color: '#F97316' },
  { key: 'fluids', name: 'Hydraulic Fluids', color: '#F97316' },
  { key: 'systems', name: 'System Types', color: '#F97316' },
  { key: 'components', name: 'Components', color: '#F97316' },
  { key: 'pumps', name: 'Pumps & Actuators', color: '#F97316' },
  { key: 'pneumatics', name: 'Pneumatic Systems', color: '#F97316' },
  { key: 'plumbing', name: 'Plumbing', color: '#F97316' },
]
```

Note: All section colors are orange — the only accent color. Section differentiation comes from the name text, not from colors.

**Question coverage targets (minimum):**
- `fundamentals`: ~25 — Pascal's Law, F=PA, area/volume/stroke calcs, HP (550 ft-lb/s, 33000 ft-lb/min, 746W), work=F×D, hydraulic HP formula (GPM×PSI/1714), 231 cu in per gallon, incompressibility, efficiency
- `fluids`: ~25 — MIL-H-5606 (red, mineral, neoprene seals, naphtha clean), MIL-H-83282 (fire-resistant, -40°F limit), MIL-H-6083 (rust-inhibited 5606), Skydrol (phosphate ester, butyl seals, soap+water clean, PPE), viscosity definition + temp relationship, flash/fire point, contamination types, 40 micron eye limit, sampling intervals, fluid degradation signs
- `systems`: ~20 — Open center (series, no idle pressure, gradual pressure build), closed center (parallel, constant pressure), constant delivery pump + pressure regulator, variable displacement + compensator, relief valve as backup, unloading valve, fly-by-wire, Boeing 787, power packs, power boost
- `components`: ~30 — Reservoirs (baffles, standpipe, bootstrap markings, pressurization methods, finger strainer, air bleed), filters (10 micron, 50 psi bypass, replacement intervals 600/1500/3000), seals (packing=moving, gasket=stationary, one-way, open end toward pressure), accumulators (1/3 precharge), check/restrictor check, sequence, priority, fuse, selector (poppet+spool), pressure-reducing, flow equalizer
- `pumps`: ~10 — Engine-driven variable displacement, shear section, cavitation, case drain to reservoir, linear/rotary actuators, single/double-acting, balanced/unbalanced
- `pneumatics`: ~10 — 1000-3000 psi high-pressure, limited supply, bleed air for medium (50-150 psi), blue desiccant, pneudraulics, 3100 psi nitrogen, moisture separator downstream
- `plumbing`: ~10+ — 1100 aluminum alloy tubing, 5052/6061 for higher pressure, 37° flare angle, AN fittings, hose lay lines, torque values, Teflon hose for high temp

Use the user's 162 answers for fact-checking. Every answer must be accurate per FAA-H-8083-31.

The `diagram` field should be set on questions where the visual genuinely aids understanding. Use these keys (matching the diagram components built in Task 5):
- `pascalLaw` — on Pascal's Law / pressure transmission questions
- `openCenter` — on open center system questions
- `closedCenter` — on closed center system questions
- `actuator` — on double-acting actuator questions
- `reservoir` — on standpipe/reservoir questions
- `filterBypass` — on filter/bypass questions
- `cylinderCalc` — on area/force/volume calculation questions
- `pumpTypes` — on constant vs variable displacement questions
- `sealTypes` — on packing vs gasket questions
- `pneudraulics` — on pneudraulic system questions
- `viscosity` — on viscosity/temperature questions
- `pneumaticValve` — on pneumatic brake valve questions

- [ ] **Step 2: Verify question count and coverage**

Open the file and manually verify:
- Total question count >= 130
- Each section has at least its target count
- Every question has all required fields (id, section, q, a, c, exp)
- `c` index is valid (0, 1, or 2) and points to the correct answer
- `diagram` keys are only the 12 listed above
- No duplicate question IDs
- Questions are written in fill-in-the-blank format (contain "________")

- [ ] **Step 3: Commit**

```bash
git add src/data/questions.js
git commit -m "feat: add 130+ FAA A&P exam questions for hydraulics and pneumatics"
```

---

## Task 4: Home Screen

**Files:**
- Create: `src/components/HomeScreen.jsx`
- Create: `src/components/HomeScreen.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create HomeScreen component**

Create `src/components/HomeScreen.jsx`:

```jsx
import { SECTIONS, questions } from '../data/questions.js'
import logo from '../assets/phnx-logo.jpeg'
import './HomeScreen.css'

export default function HomeScreen({ onStart }) {
  return (
    <div className="home">
      <div className="home-logo">
        <img src={logo} alt="PHNX Foundries" />
      </div>

      <div className="home-header">
        <span className="home-label">AMA 214</span>
        <h1 className="home-title">Hydraulics & Pneumatics</h1>
        <p className="home-subtitle">FAA A&P Practice Exam</p>
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
        <div className="home-sections">
          {SECTIONS.map(s => {
            const count = questions.filter(q => q.section === s.key).length
            return (
              <div key={s.key} className="home-section-row">
                <span className="home-section-name">{s.name}</span>
                <span className="home-section-count">{count} Q</span>
              </div>
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
    </div>
  )
}
```

- [ ] **Step 2: Create HomeScreen styles**

Create `src/components/HomeScreen.css`:

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
}

.home-section-row:last-child {
  border-bottom: none;
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
}

.home-start:hover {
  opacity: 0.9;
}
```

- [ ] **Step 3: Wire up App.jsx with screen routing**

Replace `src/App.jsx`:

```jsx
import { useState } from 'react'
import { ThemeProvider } from './ThemeContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import { questions } from './data/questions.js'
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

  const startExam = () => {
    setExamQuestions(shuffle(questions))
    setAnswers({})
    setFlagged(new Set())
    setStartTime(Date.now())
    setEndTime(null)
    setScreen('exam')
  }

  const finishExam = () => {
    setEndTime(Date.now())
    setScreen('results')
  }

  return (
    <ThemeProvider>
      <ThemeToggle />
      <div className="container">
        {screen === 'home' && <HomeScreen onStart={startExam} />}
        {screen === 'exam' && <div>Exam screen (Task 5)</div>}
        {screen === 'results' && <div>Results screen (Task 7)</div>}
      </div>
    </ThemeProvider>
  )
}
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Verify:
- PHNX logo displays (inverts in light mode)
- Exam title and subtitle render
- Section list with question counts displays
- "BEGIN EXAM" button is orange
- Clicking "BEGIN EXAM" switches to placeholder exam text
- Responsive: full-width on mobile, max 900px centered on desktop
- Dark/light toggle works with all cards and text

- [ ] **Step 5: Commit**

```bash
git add src/components/HomeScreen.jsx src/components/HomeScreen.css src/App.jsx
git commit -m "feat: add home screen with logo, sections, and exam start"
```

---

## Task 5: SVG Diagrams

**Files:**
- Create: `src/diagrams/PascalLaw.jsx`
- Create: `src/diagrams/OpenCenter.jsx`
- Create: `src/diagrams/ClosedCenter.jsx`
- Create: `src/diagrams/DoubleActingActuator.jsx`
- Create: `src/diagrams/Reservoir.jsx`
- Create: `src/diagrams/FilterBypass.jsx`
- Create: `src/diagrams/CylinderCalc.jsx`
- Create: `src/diagrams/PumpTypes.jsx`
- Create: `src/diagrams/SealTypes.jsx`
- Create: `src/diagrams/Pneudraulics.jsx`
- Create: `src/diagrams/ViscosityCurve.jsx`
- Create: `src/diagrams/PneumaticBrakeValve.jsx`
- Create: `src/diagrams/index.js`

All diagrams use CSS custom properties for theming. Every SVG uses:
- `var(--color-diagram-bg)` for background
- `var(--color-diagram-line)` for primary lines/text
- `var(--color-diagram-secondary)` for secondary elements
- `var(--color-accent)` (`#F97316`) for key highlights only (force arrows, pressure points, important labels)

- [ ] **Step 1: Create the diagram registry**

Create `src/diagrams/index.js`:

```js
import PascalLaw from './PascalLaw.jsx'
import OpenCenter from './OpenCenter.jsx'
import ClosedCenter from './ClosedCenter.jsx'
import DoubleActingActuator from './DoubleActingActuator.jsx'
import Reservoir from './Reservoir.jsx'
import FilterBypass from './FilterBypass.jsx'
import CylinderCalc from './CylinderCalc.jsx'
import PumpTypes from './PumpTypes.jsx'
import SealTypes from './SealTypes.jsx'
import Pneudraulics from './Pneudraulics.jsx'
import ViscosityCurve from './ViscosityCurve.jsx'
import PneumaticBrakeValve from './PneumaticBrakeValve.jsx'

const diagrams = {
  pascalLaw: PascalLaw,
  openCenter: OpenCenter,
  closedCenter: ClosedCenter,
  actuator: DoubleActingActuator,
  reservoir: Reservoir,
  filterBypass: FilterBypass,
  cylinderCalc: CylinderCalc,
  pumpTypes: PumpTypes,
  sealTypes: SealTypes,
  pneudraulics: Pneudraulics,
  viscosity: ViscosityCurve,
  pneumaticValve: PneumaticBrakeValve,
}

export default diagrams
```

- [ ] **Step 2: Create all 12 diagram components**

Each diagram follows this pattern — an SVG that uses CSS custom property values via inline `style` attributes (since SVG `fill`/`stroke` can reference CSS vars). The diagram must be responsive (width 100%) with a max-width appropriate to the content.

Create each file in `src/diagrams/`. Use the user's existing SVG diagrams as a structural reference but redraw using the theme-aware colors:
- Replace all hardcoded dark backgrounds (`#0a1628`) with `var(--color-diagram-bg)`
- Replace all light text colors (`#e2e8f0`, `#f1f5f9`) with `var(--color-diagram-text)`
- Replace all secondary grays (`#94a3b8`, `#64748b`) with `var(--color-diagram-secondary)`
- Replace all blue (`#3b82f6`, `#93c5fd`) and green (`#10b981`, `#6ee7b7`) and red (`#ef4444`, `#fca5a5`) and yellow (`#f59e0b`, `#fcd34d`) with `var(--color-diagram-line)` for structural elements or `var(--color-accent)` for key highlights
- The diagrams should be clean, minimal, and readable in both light and dark mode

Example pattern for PascalLaw.jsx:

```jsx
export default function PascalLaw() {
  return (
    <svg viewBox="0 0 400 200" style={{
      width: '100%',
      maxWidth: 400,
      background: 'var(--color-diagram-bg)',
      borderRadius: 8,
      padding: 8,
      margin: '0 auto',
      display: 'block',
    }}>
      {/* Title */}
      <text x="200" y="18" textAnchor="middle"
        style={{ fill: 'var(--color-diagram-text)', fontSize: 12, fontWeight: 'bold' }}>
        Pascal&apos;s Law: P = F/A
      </text>

      {/* Small cylinder */}
      <rect x="40" y="80" width="60" height="100" rx="4"
        fill="none" style={{ stroke: 'var(--color-diagram-secondary)' }} strokeWidth="2" />

      {/* Fluid */}
      <rect x="40" y="100" width="60" height="80"
        style={{ fill: 'var(--color-diagram-secondary)' }} fillOpacity="0.2" />

      {/* Small piston */}
      <rect x="50" y="95" width="40" height="10" rx="3"
        style={{ fill: 'var(--color-accent)' }} />

      {/* F1 label */}
      <text x="70" y="78" textAnchor="middle"
        style={{ fill: 'var(--color-accent)', fontSize: 11, fontWeight: 'bold' }}>
        F1 (small)
      </text>

      {/* Connecting tube */}
      <rect x="100" y="130" width="200" height="30" rx="4"
        fill="none" style={{ stroke: 'var(--color-diagram-secondary)' }} strokeWidth="2" />
      <rect x="100" y="130" width="200" height="30"
        style={{ fill: 'var(--color-diagram-secondary)' }} fillOpacity="0.2" />

      {/* Large cylinder */}
      <rect x="300" y="40" width="80" height="140" rx="4"
        fill="none" style={{ stroke: 'var(--color-diagram-secondary)' }} strokeWidth="2" />
      <rect x="300" y="60" width="80" height="120"
        style={{ fill: 'var(--color-diagram-secondary)' }} fillOpacity="0.2" />

      {/* Large piston */}
      <rect x="310" y="55" width="60" height="10" rx="3"
        style={{ fill: 'var(--color-diagram-line)' }} />

      {/* F2 label */}
      <text x="340" y="38" textAnchor="middle"
        style={{ fill: 'var(--color-diagram-text)', fontSize: 11, fontWeight: 'bold' }}>
        F2 (large)
      </text>

      {/* Area labels */}
      <text x="70" y="190" textAnchor="middle"
        style={{ fill: 'var(--color-diagram-secondary)', fontSize: 10 }}>A1</text>
      <text x="340" y="190" textAnchor="middle"
        style={{ fill: 'var(--color-diagram-secondary)', fontSize: 10 }}>A2</text>
    </svg>
  )
}
```

Follow this same pattern for all 12 diagrams. Use the user's existing SVGs as the structural blueprint for what each diagram should show, but adapt colors to the theme system.

- [ ] **Step 3: Verify diagrams render in both themes**

Temporarily add a test page or import a few diagrams in App.jsx to verify they render correctly in both light and dark mode. Orange should only appear on key highlights.

- [ ] **Step 4: Commit**

```bash
git add src/diagrams/
git commit -m "feat: add 12 theme-aware SVG diagrams for hydraulic and pneumatic concepts"
```

---

## Task 6: Exam Screen

**Files:**
- Create: `src/components/ExamScreen.jsx`
- Create: `src/components/ExamScreen.css`
- Create: `src/components/QuestionNav.jsx`
- Create: `src/components/QuestionNav.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create QuestionNav component**

Create `src/components/QuestionNav.jsx`:

```jsx
import './QuestionNav.css'

export default function QuestionNav({ questions, answers, currentIndex, flagged, onGoTo }) {
  return (
    <details className="qnav">
      <summary className="qnav-summary">
        Question Navigator {flagged.size > 0 && `(${flagged.size} flagged)`}
      </summary>
      <div className="qnav-grid">
        {questions.map((q, i) => {
          const isAnswered = answers[q.id] !== undefined
          const isCorrect = answers[q.id] === q.c
          const isCurrent = i === currentIndex
          const isFlagged = flagged.has(q.id)

          let cls = 'qnav-cell'
          if (isCurrent) cls += ' qnav-cell--current'
          else if (isAnswered && isCorrect) cls += ' qnav-cell--correct'
          else if (isAnswered && !isCorrect) cls += ' qnav-cell--incorrect'
          if (isFlagged) cls += ' qnav-cell--flagged'

          return (
            <button key={i} className={cls} onClick={() => onGoTo(i)}>
              {i + 1}
            </button>
          )
        })}
      </div>
    </details>
  )
}
```

Create `src/components/QuestionNav.css`:

```css
.qnav {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  margin-bottom: 16px;
}

.qnav-summary {
  padding: 14px 18px;
  font-size: 13px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.qnav-summary::marker,
.qnav-summary::-webkit-details-marker {
  display: none;
}

.qnav-summary::before {
  content: '▸ ';
}

[open] > .qnav-summary::before {
  content: '▾ ';
}

.qnav-grid {
  padding: 8px 12px 14px;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
}

@media (max-width: 480px) {
  .qnav-grid {
    grid-template-columns: repeat(8, 1fr);
  }
}

.qnav-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  border: 1px solid var(--color-border-light);
  border-radius: 4px;
  font-size: 10px;
  color: var(--color-text-tertiary);
  padding: 0;
}

.qnav-cell--current {
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
  color: var(--color-accent);
  font-weight: 600;
}

.qnav-cell--correct {
  background: var(--color-correct-muted);
  color: var(--color-correct);
}

.qnav-cell--incorrect {
  background: var(--color-incorrect-muted);
  color: var(--color-incorrect);
}

.qnav-cell--flagged {
  color: var(--color-accent);
  font-weight: 700;
}
```

- [ ] **Step 2: Create ExamScreen component**

Create `src/components/ExamScreen.jsx`:

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
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const topRef = useRef(null)

  const q = questions[currentIndex]
  const section = SECTIONS.find(s => s.key === q.section)
  const DiagramComponent = q.diagram ? diagrams[q.diagram] : null
  const score = questions.reduce((acc, question) => acc + (answers[question.id] === question.c ? 1 : 0), 0)

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
      {/* Header bar */}
      <div className="exam-header">
        <span className="exam-timer">{formatTime(elapsed)}</span>
        <span className="exam-progress">Q {currentIndex + 1} / {questions.length}</span>
        <span className="exam-score">{score} correct</span>
      </div>

      {/* Progress bar */}
      <div className="exam-progress-bar">
        <div
          className="exam-progress-fill"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Section badge */}
      {section && (
        <span className="exam-section-badge">{section.name}</span>
      )}

      {/* Question card */}
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
              <button
                key={i}
                className={cls}
                onClick={() => selectAnswer(i)}
                disabled={showResult}
              >
                <span className="exam-answer-indicator">
                  {showResult && isCorrect && '✓'}
                  {showResult && isSelected && !isCorrect && '✗'}
                </span>
                <span className="exam-answer-text">
                  {String.fromCharCode(65 + i)}. {opt}
                </span>
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

      {/* Navigation */}
      <div className="exam-nav">
        <button className="exam-nav-prev" onClick={prev} disabled={currentIndex === 0}>
          ← PREV
        </button>
        <button
          className={`exam-nav-next ${showFeedback ? 'exam-nav-next--ready' : ''}`}
          onClick={next}
        >
          {currentIndex === questions.length - 1 ? 'FINISH EXAM' : 'NEXT →'}
        </button>
      </div>

      <QuestionNav
        questions={questions}
        answers={answers}
        currentIndex={currentIndex}
        flagged={flagged}
        onGoTo={goTo}
      />

      <button className="exam-end" onClick={onFinish}>
        End Exam & View Results
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Create ExamScreen styles**

Create `src/components/ExamScreen.css`:

```css
.exam {
  padding-bottom: 32px;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}

.exam-timer {
  color: var(--color-text-tertiary);
}

.exam-progress {
  color: var(--color-text);
  font-weight: 600;
}

.exam-score {
  color: var(--color-accent);
}

.exam-progress-bar {
  background: var(--color-bg-card);
  border-radius: 4px;
  height: 4px;
  margin-bottom: 16px;
  overflow: hidden;
}

.exam-progress-fill {
  background: var(--color-accent);
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.exam-section-badge {
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

.exam-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

@media (min-width: 640px) {
  .exam-card {
    padding: 28px;
  }
}

.exam-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.exam-qid {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.exam-flag {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--color-border);
  padding: 0;
  line-height: 1;
}

.exam-flag--active {
  color: var(--color-accent);
}

.exam-question {
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text);
  margin-bottom: 16px;
}

@media (min-width: 640px) {
  .exam-question {
    font-size: 17px;
  }
}

.exam-diagram {
  margin-bottom: 16px;
}

.exam-answers {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exam-answer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--color-bg);
  border: 1.5px solid var(--color-border-light);
  border-radius: 8px;
  text-align: left;
  transition: border-color 0.2s, background 0.2s;
  min-height: 48px;
}

.exam-answer:not(:disabled):hover {
  border-color: var(--color-border);
  background: var(--color-bg-card-hover);
}

.exam-answer--selected {
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
}

.exam-answer--correct {
  border-color: var(--color-correct);
  background: var(--color-correct-muted);
}

.exam-answer--incorrect {
  border-color: var(--color-incorrect);
  background: var(--color-incorrect-muted);
}

.exam-answer-indicator {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 2px solid var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
}

.exam-answer--correct .exam-answer-indicator {
  background: var(--color-correct);
  border-color: var(--color-correct);
  color: #fff;
}

.exam-answer--incorrect .exam-answer-indicator {
  background: var(--color-incorrect);
  border-color: var(--color-incorrect);
  color: #fff;
}

.exam-answer--selected .exam-answer-indicator {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.exam-answer-text {
  font-size: 14px;
  line-height: 1.4;
  color: var(--color-text);
}

.exam-answer--correct .exam-answer-text {
  color: var(--color-correct);
}

.exam-answer--incorrect .exam-answer-text {
  color: var(--color-incorrect);
}

.exam-explanation {
  margin-top: 16px;
  padding: 14px;
  border-radius: 8px;
  border-left: 3px solid;
}

.exam-explanation--correct {
  background: var(--color-correct-muted);
  border-left-color: var(--color-correct);
}

.exam-explanation--incorrect {
  background: var(--color-incorrect-muted);
  border-left-color: var(--color-incorrect);
}

.exam-explanation-label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.exam-explanation--correct .exam-explanation-label {
  color: var(--color-correct);
}

.exam-explanation--incorrect .exam-explanation-label {
  color: var(--color-incorrect);
}

.exam-explanation-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.exam-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.exam-nav-prev {
  flex: 1;
  padding: 14px;
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.exam-nav-prev:disabled {
  opacity: 0.3;
  cursor: default;
}

.exam-nav-next {
  flex: 2;
  padding: 14px;
  background: var(--color-bg-card);
  color: var(--color-text-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s, color 0.2s;
}

.exam-nav-next--ready {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #ffffff;
}

.exam-end {
  width: 100%;
  padding: 14px;
  background: none;
  color: var(--color-text-tertiary);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  font-size: 13px;
}
```

- [ ] **Step 4: Wire ExamScreen into App.jsx**

Update `src/App.jsx` — replace the exam screen placeholder:

```jsx
import { useState } from 'react'
import { ThemeProvider } from './ThemeContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import ExamScreen from './components/ExamScreen.jsx'
import { questions } from './data/questions.js'
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

  const startExam = () => {
    setExamQuestions(shuffle(questions))
    setAnswers({})
    setFlagged(new Set())
    setStartTime(Date.now())
    setEndTime(null)
    setScreen('exam')
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

  return (
    <ThemeProvider>
      <ThemeToggle />
      <div className="container">
        {screen === 'home' && <HomeScreen onStart={startExam} />}
        {screen === 'exam' && (
          <ExamScreen
            questions={examQuestions}
            answers={answers}
            flagged={flagged}
            startTime={startTime}
            onAnswer={handleAnswer}
            onToggleFlag={handleToggleFlag}
            onFinish={finishExam}
          />
        )}
        {screen === 'results' && <div>Results screen (Task 7)</div>}
      </div>
    </ThemeProvider>
  )
}
```

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```

Verify:
- Start exam from home screen
- Questions display in fill-in-the-blank format
- Selecting an answer shows feedback (correct green, incorrect red)
- Explanation appears after answering
- Diagrams render on relevant questions and adapt to light/dark
- Timer counts up
- Progress bar advances
- Flag button toggles orange star
- Prev/Next navigation works
- Question navigator grid shows correct/incorrect/current/flagged states
- "End Exam & View Results" and "FINISH EXAM" both advance to results placeholder
- All responsive: mobile full-width, desktop centered max 900px, touch targets 48px+

- [ ] **Step 6: Commit**

```bash
git add src/components/ExamScreen.jsx src/components/ExamScreen.css src/components/QuestionNav.jsx src/components/QuestionNav.css src/App.jsx
git commit -m "feat: add exam screen with question display, answer feedback, navigation, and diagram rendering"
```

---

## Task 7: Results Screen

**Files:**
- Create: `src/components/ResultsScreen.jsx`
- Create: `src/components/ResultsScreen.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create ResultsScreen component**

Create `src/components/ResultsScreen.jsx`:

```jsx
import { SECTIONS } from '../data/questions.js'
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
}) {
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
  })

  const missed = questions
    .map((q, i) => ({ ...q, examIndex: i }))
    .filter(q => answers[q.id] !== q.c)

  return (
    <div className="results">
      <div className="results-score">
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

- [ ] **Step 2: Create ResultsScreen styles**

Create `src/components/ResultsScreen.css`:

```css
.results {
  padding-bottom: 48px;
}

.results-score {
  text-align: center;
  margin-bottom: 24px;
}

.results-pct {
  font-size: 64px;
  font-weight: 800;
  line-height: 1;
}

.results-pct--pass { color: var(--color-correct); }
.results-pct--fail { color: var(--color-incorrect); }

.results-verdict {
  font-size: 18px;
  font-weight: 600;
  margin-top: 4px;
}

.results-verdict--pass { color: var(--color-correct); }
.results-verdict--fail { color: var(--color-incorrect); }

.results-detail {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-top: 8px;
}

.results-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.results-card-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 1px;
  text-transform: uppercase;
  display: block;
  margin-bottom: 16px;
}

.results-section {
  margin-bottom: 14px;
}

.results-section:last-of-type {
  margin-bottom: 0;
}

.results-section-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.results-section-name {
  font-size: 13px;
  color: var(--color-text);
}

.results-section-score {
  font-size: 13px;
}

.results-section-score--pass { color: var(--color-correct); }
.results-section-score--fail { color: var(--color-incorrect); }

.results-bar {
  background: var(--color-bg);
  border-radius: 4px;
  height: 6px;
  overflow: hidden;
}

.results-bar-fill {
  background: var(--color-accent);
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s;
}

.results-bar-fill--fail {
  background: var(--color-incorrect);
}

.results-missed {
  max-height: 400px;
  overflow-y: auto;
}

.results-missed-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  margin-bottom: 6px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
}

.results-missed-item:hover {
  border-color: var(--color-border);
}

.results-missed-qid {
  font-size: 12px;
  color: var(--color-incorrect);
  margin-bottom: 4px;
  font-weight: 600;
}

.results-missed-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin-bottom: 6px;
}

.results-missed-answers {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.results-missed-yours { color: var(--color-incorrect); }
.results-missed-correct { color: var(--color-correct); }

.results-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
}

.results-retake {
  flex: 1;
  padding: 14px;
  background: var(--color-accent);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
}

.results-retake:hover {
  opacity: 0.9;
}

.results-home {
  flex: 1;
  padding: 14px;
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
}

.results-footer {
  text-align: center;
  padding-top: 16px;
}

.results-footer-logo {
  height: 32px;
  margin: 0 auto;
  opacity: 0.5;
  object-fit: contain;
}

[data-theme="light"] .results-footer-logo {
  filter: invert(1);
  opacity: 0.4;
}
```

- [ ] **Step 3: Wire ResultsScreen into App.jsx**

Update `src/App.jsx` — replace the results placeholder and add the go-to-question handler. The final App.jsx:

```jsx
import { useState } from 'react'
import { ThemeProvider } from './ThemeContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import ExamScreen from './components/ExamScreen.jsx'
import ResultsScreen from './components/ResultsScreen.jsx'
import { questions } from './data/questions.js'
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

  const startExam = () => {
    setExamQuestions(shuffle(questions))
    setAnswers({})
    setFlagged(new Set())
    setStartTime(Date.now())
    setEndTime(null)
    setReviewIndex(null)
    setScreen('exam')
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
        {screen === 'home' && <HomeScreen onStart={startExam} />}
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
          />
        )}
      </div>
    </ThemeProvider>
  )
}
```

Note: `ExamScreen` needs to accept an `initialIndex` prop. Update the `useState(0)` in ExamScreen to:
```jsx
const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0)
```
And add `initialIndex` to the props destructuring.

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Verify:
- Complete an exam (answer all questions or click "End Exam")
- Score percentage and pass/fail displays correctly
- Section breakdown shows per-section scores with progress bars
- Missed questions list shows with correct formatting
- Clicking a missed question navigates back to exam at that question
- Retake button starts a fresh randomized exam
- Home button returns to home screen
- PHNX logo appears as subtle footer on results
- All responsive on mobile and desktop

- [ ] **Step 5: Commit**

```bash
git add src/components/ResultsScreen.jsx src/components/ResultsScreen.css src/App.jsx src/components/ExamScreen.jsx
git commit -m "feat: add results screen with section breakdown and missed question review"
```

---

## Task 8: Deploy to GitHub Pages

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install gh-pages package**

```bash
npm install --save-dev gh-pages
```

- [ ] **Step 2: Add deploy scripts to package.json**

Add these scripts to `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

- [ ] **Step 3: Build and verify locally**

```bash
npm run build
npm run preview
```

Open the preview URL and verify the entire app works: home → exam → results → retake, dark/light toggle, diagrams, responsive on mobile viewport.

- [ ] **Step 4: Create GitHub repository**

```bash
gh repo create hydr-pnu-exam --public --source=. --push
```

If `gh` CLI is not installed or not authenticated, create the repo manually on GitHub and push:
```bash
git remote add origin https://github.com/<username>/hydr-pnu-exam.git
git push -u origin main
```

- [ ] **Step 5: Deploy to GitHub Pages**

```bash
npm run deploy
```

This builds the project and pushes the `dist/` folder to the `gh-pages` branch.

- [ ] **Step 6: Enable GitHub Pages in repo settings**

Go to the GitHub repo → Settings → Pages → Source: "Deploy from a branch" → Branch: `gh-pages` / `/ (root)` → Save.

Wait 1-2 minutes for the deployment.

- [ ] **Step 7: Verify live site**

Open `https://<username>.github.io/hydr-pnu-exam/` and verify:
- Site loads on desktop and mobile
- All screens work (home, exam, results)
- Dark/light toggle works
- Diagrams render
- No broken assets (logo loads, fonts load)

- [ ] **Step 8: Commit deploy config**

```bash
git add package.json package-lock.json
git commit -m "feat: add GitHub Pages deploy configuration"
git push
```

---

## Summary

| Task | What it produces |
|------|-----------------|
| 1 | Vite + React scaffold, git init |
| 2 | Dark/light theme system with CSS variables and toggle |
| 3 | 130+ researched FAA A&P questions |
| 4 | Home screen with PHNX logo, sections, start button |
| 5 | 12 theme-aware SVG diagrams |
| 6 | Exam screen with questions, answers, feedback, navigation |
| 7 | Results screen with scores, breakdown, missed review |
| 8 | GitHub Pages deployment — shareable live link |
