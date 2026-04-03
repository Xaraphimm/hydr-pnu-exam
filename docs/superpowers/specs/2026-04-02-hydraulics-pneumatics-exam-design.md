# AMA 214: Hydraulics & Pneumatics — FAA A&P Practice Exam

## Overview

A shareable, mobile-first practice exam website for FAA Aircraft & Powerplant (A&P) students studying Hydraulics & Pneumatics (AMA 214). Deployed to GitHub Pages as a single static link that anyone can open — no login, no install.

## Question Content

### Format
- Fill-in-the-blank sentences with 3 multiple-choice answer options
- Example: "MIL-H-5606 hydraulic fluid is dyed ________." → A) Blue B) Red C) Purple
- Instant feedback after each answer with an explanation sourced from FAA-H-8083-31
- Randomized question order each attempt

### Coverage (120+ questions minimum)
Researched against FAA-H-8083-31 (Aviation Maintenance Technician Handbook — Airframe), Chapter 12.

1. **Hydraulic Fundamentals** (~25 questions) — Pascal's Law, force/pressure/area calculations, horsepower, work/power, fluid incompressibility, system efficiency
2. **Hydraulic Fluids** (~25 questions) — MIL-H-5606, MIL-H-83282, MIL-H-6083, Skydrol, viscosity, contamination types, cleaning procedures, PPE, temperature behavior, flash/fire point
3. **System Types** (~20 questions) — Open center (series) vs closed center (parallel), constant delivery vs variable displacement pumps, pressure regulators, relief valves, fly-by-wire, power packs
4. **Components** (~30 questions) — Reservoirs (standpipe, bootstrap, pressurized), filters (micron, bypass), seals (packing vs gasket), accumulators, check valves, restrictor check valves, sequence valves, priority valves, hydraulic fuses, selector valves, pressure-reducing valves, flow equalizers
5. **Pumps & Actuators** (~10 questions) — Engine-driven pumps, cavitation, linear/rotary actuators, single/double-acting, balanced/unbalanced, shear sections, case drain lines
6. **Pneumatic Systems** (~10 questions) — High/medium/low pressure systems, pneudraulics, nitrogen emergency gear extension, desiccant cartridges, moisture separators, bleed air
7. **Plumbing** (~10+ questions) — Tubing materials (1100 aluminum, 5052, stainless), fitting types, flare angles (37 deg), hose classifications, torque values, lay lines

## Visual Diagrams

12+ inline SVG diagrams, rendered only on questions where they genuinely aid understanding.

### Planned Diagrams
- Pascal's Law (dual-cylinder pressure transmission)
- Open Center System (series valve flow path)
- Closed Center System (parallel valve flow path)
- Double-Acting Actuator (piston, ports, rod)
- Reservoir with Standpipe (main vs emergency draw points)
- Filter with Bypass Valve (flow path and bypass route)
- Cylinder Area & Force (circle cross-section + formulas)
- Pump Types (constant delivery vs variable displacement comparison)
- Seal Types (packing vs gasket comparison)
- Pneudraulic System (nitrogen → fluid → actuator chain)
- Viscosity vs Temperature (inverse relationship curve)
- Pneumatic Emergency Brake Valve (3-port housing)

### Diagram Color Rules
- Dark mode: white/light gray lines and text on dark backgrounds
- Light mode: black/dark gray lines and text on light backgrounds
- Orange (`#F97316`) for key highlights only — force arrows, pressure points, important labels
- Gray for secondary/structural elements

## UI/UX Design

### Color Palette (strict black, white, orange)
- **Dark mode**: `#000000` background, `#FFFFFF` text, `#F97316` orange accents
- **Light mode**: `#FFFFFF` background, `#000000` text, `#F97316` orange accents
- Grays derived contextually (dark gray cards on black, light gray cards on white)
- Orange used sparingly: progress bar fill, flag stars, section indicators, CTA buttons, correct/incorrect feedback accent

### Theme Toggle
- Sun/moon icon in the top corner
- Preference persisted via localStorage
- Respects `prefers-color-scheme` on first visit

### PHNX Foundries Logo
- Header placement on home screen (clean, prominent but not oversized)
- Subtle footer mark on exam and results screens
- Inverts or uses appropriate contrast for light mode vs dark mode

### Typography
- Clean sans-serif: Inter (with system font fallback stack)
- Professional feel — no monospace

### Screens

**Home Screen**
- PHNX Foundries logo
- Exam title: "AMA 214: Hydraulics & Pneumatics"
- Subtitle: "FAA A&P Practice Exam"
- Section breakdown with question counts
- Total question count, passing score (70%)
- "BEGIN EXAM" button (orange)

**Exam Screen**
- Top bar: timer, question progress (Q 14 / 130), running score
- Progress bar (orange fill)
- Section badge for current question
- Fill-in-the-blank question text
- Inline SVG diagram (when relevant)
- 3 answer option buttons (large touch targets)
- Flag/bookmark button (orange star)
- After answering: correct/incorrect feedback with explanation
- Prev/Next navigation
- Collapsible question navigator grid (shows answered, correct, incorrect, flagged, current)
- "End Exam & View Results" option

**Results Screen**
- Large score percentage
- Pass/Fail indicator (70% threshold)
- Time taken
- Section-by-section breakdown with progress bars
- List of missed questions (clickable to review the question and explanation)
- "Retake Exam" and "Home" buttons

## Responsive Layout (Critical)

Mobile-first design. The exam must work flawlessly on phones, tablets, and desktop.

### Breakpoints
- **Mobile (< 640px)**: Full-width edge-to-edge with minimal padding (16px). Stacked layout. Touch targets 48px+ minimum.
- **Tablet (640–1024px)**: ~90% viewport width, centered.
- **Desktop (1024px+)**: `max-width: 900px`, centered. No large dead white/black space on either side.

Question cards, answer buttons, and SVG diagrams stretch to fill the container at every breakpoint.

## Tech Stack

- **Vite + React** — fast builds, clean component structure
- **CSS Modules or scoped CSS** — no CSS framework, keeps it lightweight
- **GitHub Pages** — static deploy, single shareable URL
- **No backend, no database, no auth** — pure client-side
- **Offline capable** — once loaded, works without internet

## File Structure

```
src/
  components/
    App.jsx           — root, theme provider, screen routing
    HomeScreen.jsx    — landing page with logo and exam info
    ExamScreen.jsx    — question display, answers, navigation
    ResultsScreen.jsx — score breakdown and review
    QuestionNav.jsx   — collapsible question grid navigator
    ThemeToggle.jsx   — dark/light mode switch
    diagrams/         — one file per SVG diagram component
  data/
    questions.js      — all 120+ questions with metadata
  styles/
    theme.css         — CSS custom properties for dark/light
    global.css        — base styles, typography, responsive
  assets/
    phnx-logo.jpeg    — PHNX Foundries logo
  main.jsx            — entry point
index.html
vite.config.js
```

## Deployment

- GitHub repository with GitHub Pages enabled on the `gh-pages` branch
- `npm run build` produces static files in `dist/`
- Deploy via `gh-pages` package or GitHub Actions
- Final URL: `https://<username>.github.io/hydr-pnu-exam/`
