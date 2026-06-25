# AGENTS.md — PHNX A&P Exam Prep

> Operating guide for AI agents (and new humans) working in this repo. Read this **before**
> making changes. The goal: understand the codebase fast and ship changes **without breaking it**.

**What this is:** "PHNX A&P Exam Prep" — a React 19 + Vite 8 **PWA** for FAA Aviation Mechanic
(A&P = Airframe & Powerplant) written-exam prep. Offline-first, all progress stored in
`localStorage`. Deployed to GitHub Pages under the base path `/hydr-pnu-exam/`
(live: https://xaraphimm.github.io/hydr-pnu-exam/).

---

## Golden rules (don't break these)

1. **Keep the gates green at every commit:** `npm run lint`, `npm test`, and `npm run build`
   must all pass. There are **118 tests** today — don't regress them. If you intentionally change
   behavior, update/add tests and call it out explicitly.
2. **Install with legacy peer deps:** always `npm install --legacy-peer-deps` (there is a
   pre-existing `vite-plugin-pwa` ↔ Vite 8 peer conflict; a plain `npm install` will fail).
3. **Never change data shapes or scoring logic.** Question objects, topic IDs, and the
   `answers[q.id] === q.c` scoring contract are depended on across the app and tests.
4. **Keep the design language flat (shadcn/Tailwind v4).** No gradients. Use semantic design
   tokens, not hardcoded colors. Support both light and dark themes.
5. **Question banks must stay lazily imported** (out of the main JS chunk). Don't statically
   import anything from `src/data/**` into `App.jsx`/components.
6. **Don't deploy or merge PRs without explicit human approval.** `npm run deploy` ships to
   production. Keep PRs in draft until told otherwise.
7. **Small, reversible changes.** One logical change per commit; no force-push, no amending
   pushed commits. For perf commits, include measured before/after numbers in the message.
8. **Verify UI changes visually** with `npm run visual-check` in light + dark, mobile + desktop.

---

## Commands

| Task | Command | Notes |
|---|---|---|
| Install | `npm install --legacy-peer-deps` | Required flag (peer conflict). |
| Dev server | `npm run dev` | Vite, served under `/hydr-pnu-exam/`. |
| Lint | `npm run lint` | ESLint flat config; must stay clean. |
| Test | `npm test` | Vitest run (jsdom). 118 tests must stay green. |
| Test (watch) | `npm run test:watch` | Vitest watch mode. |
| Build | `npm run build` | Watch the bundle-size report (see Performance). |
| Preview build | `npm run preview` | Serves `dist/` for a production-like check. |
| Visual regression | `npm run visual-check` | Playwright; first run `npx playwright install chromium`. |
| Deploy (human-gated) | `npm run deploy` | `gh-pages -d dist` → `gh-pages` branch. **Do not run without approval.** |

**Data / build scripts** (Node, run directly):
- `npm run split-pdfs` → `scripts/split-pdfs.mjs`
- `node scripts/generate-acs-codes.mjs` (regenerates `src/data/acs-codes.js`)
- `node scripts/validate-questions.mjs` (validates question banks)
- `node scripts/merge-questions.mjs`

---

## Tech stack & conventions

- **React 19 + Vite 8**, plain **JavaScript/JSX** (no TypeScript), ESM modules.
- **Tailwind CSS v4** via `@tailwindcss/vite`. There is **no `tailwind.config.js`** — all theme
  config lives in `src/styles/index.css` (`@theme`, CSS custom properties).
- **shadcn/ui** ("new-york" style, `tsx: false` — see `components.json`). UI primitives live in
  `src/components/ui/`. Icons from **lucide-react**. Primitives are built on **Radix**.
- **Path alias `@` → `./src`**, configured in `vite.config.js`, `vitest.config.js`, and
  `jsconfig.json`. Use `@/components/ui/button`, `@/lib/utils`, etc.
- Helpers: `cn()` (class merge) in `src/lib/utils.js`; mastery color maps in `src/lib/ui.js`.
- ESLint note: unused identifiers matching `^[A-Z_]` are allowed (constants/components).
- **Prefer reusing existing `src/components/ui/*` primitives and `Screen`/`PageHeader`** over
  writing new bespoke markup or CSS.

---

## Project map

```
index.html              # App shell + CSP meta + theme-color + manifest link
visual.html             # Dev-only entry for the visual harness
vite.config.js          # base '/hydr-pnu-exam/', react + tailwind + VitePWA
vitest.config.js        # jsdom, globals, @ alias, tests/setup.js
eslint.config.js        # flat config
components.json          # shadcn config (style new-york, css var tokens)
src/
  main.jsx              # createRoot → StrictMode > AppErrorBoundary > HistoryProvider > App
  App.jsx              # ⭐ navigation state machine (see below). Holds all session state.
  ThemeContext.jsx     # theme state, persists 'phnx-theme', sets data-theme on <html>
  HistoryContext.jsx   # progress/bookmarks/notes/attempts in localStorage
  styles/index.css     # ⭐ design tokens + Tailwind config + dark-mode variant
  components/
    Screen.jsx         # shared layout: <Screen> (width variants) + <PageHeader>
    ui/                # shadcn primitives (button, card, dialog, tabs, select, ...)
    *.jsx              # screens (TopicListScreen, ExamScreen, PdfViewer, ...)
  diagrams/            # SVG diagram components + index.js registry (code-split candidate)
  data/
    index.js           # ⭐ lazy question loaders + cache + QUESTION_COUNTS
    topics.js          # TOPICS + CATEGORIES metadata
    acs-codes.js       # AUTO-GENERATED — do not hand-edit
    airframe/ powerplant/  # question banks (one file per topic)
  utils/               # pure logic: exam-generator, acs-filter, mastery, shuffle, storage, migration
  visual/              # dev-only Playwright gallery (Gallery.jsx, fixtures.js, main.jsx)
tests/                 # Vitest + Testing Library; tests/setup.js polyfills localStorage
scripts/               # build/data scripts incl. visual-check.mjs
public/                # manifest.json, icons, pdfs/
docs/                  # specs, plans, screenshots, question-audit
```

### Navigation: a state machine, not a router
There is **no router**. `src/App.jsx` owns navigation via two pieces of state:
- `tab` ∈ `home | search | bookmarks | progress` (the bottom `TabBar`).
- `screen` (within the home tab) ∈ `topic-list | subtopic | test | mock | results |
  exam-results | flashcards | flashcard-complete | history | study | acs-practice | exam-select`.

`App.jsx` also holds **all session state** (selected topic, loaded questions, answers, flagged
set, timing, mode, exam seed/version, ACS session, flashcard state) and passes it down as props
to each screen. When adding a screen, wire a new `screen` value here and pass the props the
component expects — keep this contract intact.

---

## Data model & invariants (DO NOT BREAK)

**Question object shape** (in `src/data/<category>/<topic>.js`):
```js
{
  id: "AF03-8265",      // unique; PREFIX encodes the subtopic (AF03 → AF-03)
  q: "…question stem…",
  a: ["option A", "option B", "option C"],
  c: 0,                  // index of the correct answer in `a`
  exp: "explanation…",
  ref: "FAA-H-8083-31",
  acs: "AM.II.C.K1",     // ACS code (used by ACS-targeted practice)
  diagram: null          // optional key into src/diagrams/index.js
}
```
- **Scoring is `answers[q.id] === q.c`.** Per-subtopic breakdown is derived from the `id` prefix
  (`AF03-1234` → `AF-03`). Don't change this mapping.
- `src/data/index.js` exposes per-topic dynamic `import()` loaders, `loadQuestions(topicId)`
  (with an in-memory cache), and `QUESTION_COUNTS`. **Keep question banks lazy.**
- `src/data/topics.js` defines `TOPICS` (`AF-01..AF-15`, `AF-PRACTICE`, `PP-01..PP-13`) and
  `CATEGORIES` (`airframe`/`powerplant`: `examQuestions: 100`, `passingScore: 70`). Don't rename
  IDs — they're keys everywhere.
- `src/data/acs-codes.js` is **auto-generated** from the ACS PDF. Never hand-edit; regenerate via
  `node scripts/generate-acs-codes.mjs`.
- Deterministic logic in `src/utils/exam-generator.js` (Mulberry32 `seededRandom`,
  `seededShuffle`, `generateExam`, `getAcsDistribution`) and `src/utils/acs-filter.js` is
  test-covered. Changing it changes generated exams — preserve outputs (and tests).

---

## State & persistence

- **ThemeContext** — `theme` persisted in `localStorage['phnx-theme']`; applies
  `data-theme="dark"|"light"` to `<html>` (dark mode is keyed to `[data-theme="dark"]`).
- **HistoryContext** — persists to `localStorage` keys: `phnx-confidence`, `phnx-attempts`,
  `phnx-bookmarks`, `phnx-notes`. Exposes `recordAnswer`, `saveAttempt`, bookmark/note helpers,
  `getTopicAttempts`, `clearHistory`. Legacy `hydr-pnu-*` keys are migrated once on load
  (`src/utils/migration.js`).
- **Always** read/write storage through `src/utils/storage.js` (safe try/catch wrappers +
  `createId`). Don't touch `window.localStorage` directly in components.
- All progress is **local to the device** — there is no backend. The error boundary message
  reflects this.

---

## Styling & design language (guardrails)

- Use **semantic token classes**, not raw colors: `bg-background`, `text-foreground`, `bg-card`,
  `text-card-foreground`, `text-muted-foreground`, `border-border`, `text-primary`/`bg-primary`,
  `text-destructive`, `text-success`, `ring`. Tokens are defined as oklch CSS variables in
  `src/styles/index.css` (primary = PHNX orange `#F97316`). Diagrams use `--color-diagram-*`.
- **Dark mode**: `[data-theme="dark"]` (`@custom-variant dark` in the CSS). Always check both
  themes.
- **Flat design — no gradients.** Consistent radius (`--radius`), Inter font, one spacing scale,
  consistent card/border/shadow usage.
- **Layout chrome**: a fixed bottom `TabBar` and a floating `ThemeToggle`. Wrap screen content in
  `<Screen>` (it applies `pb-28` + safe-area padding) so content never hides behind the TabBar.
  Use `<PageHeader>` for aligned titles/back buttons.
- Accessibility expectations: visible focus rings, correct roles/aria, keyboard operability,
  adequate contrast in both themes, honor `prefers-reduced-motion`, tap targets ≥ 44px on mobile.

---

## Build, PWA & deploy

- `vite.config.js`: `base: '/hydr-pnu-exam/'`; plugins `react()`, `@tailwindcss/vite`, and
  `VitePWA` (`registerType: 'autoUpdate'`, `manifest: false` → the app uses
  `public/manifest.json`, workbox precaches `**/*.{js,css,html,svg,jpeg,png,woff2}`).
- `index.html` sets a **CSP** meta tag. Note `script-src` includes `'wasm-unsafe-eval'` because
  **pdfjs** needs it — keep that if you touch the CSP. Also sets `theme-color #F97316`, loads
  Inter from Google Fonts, and links the manifest/icons.
- `PdfViewer.jsx` statically imports `react-pdf` + `pdfjs-dist` and configures the pdfjs
  `workerSrc`. **This is the heaviest dependency** and the prime candidate for lazy-loading /
  code-splitting in perf work.
- Deploy: `npm run deploy` builds and pushes `dist/` to the `gh-pages` branch. **Human-gated.**

### Performance snapshot (as of this writing — re-measure, don't trust stale numbers)
- Main chunk `dist/assets/index-*.js`: **~897 kB (~254 kB gzip)** — the biggest initial-JS win
  is lazy-loading `PdfViewer` (keeps `pdfjs`/`react-pdf` out of the main chunk).
- `pdf.worker.min.mjs` ≈ 1,046 kB (loaded as a separate worker, on demand).
- Question banks are already split into per-topic chunks (good — keep them lazy). The
  `airframe-faa-practice-test` bank is large (~523 kB) — be mindful of the PWA precache list so
  giant banks aren't precached unnecessarily.
- PWA precache currently ~28 entries. Re-check after any code-splitting change.

---

## Testing & verification workflow

Before every commit you intend to push:
1. `npm run lint` — clean.
2. `npm test` — all green (currently 118).
3. `npm run build` — succeeds; review the bundle report for regressions.
4. If you changed UI: `npm run visual-check`, then **review** `artifacts/screens/` in light +
   dark, mobile (390px) + desktop (1280px). Confirm no layout shift/overlap/blank states.

Testing details:
- Vitest + jsdom + `@testing-library/react`. `tests/setup.js` polyfills `localStorage`
  (Node 22+ ships an incomplete stub). `vitest.config.js` wires the `@` alias and globals.
- The visual harness is **dev-only** (`visual.html` + `src/visual/*`, excluded from the prod
  build). `scripts/visual-check.mjs` spawns Vite, drives Playwright Chromium with deterministic
  mock data, and writes screenshots to `artifacts/screens/` (which is **gitignored**). Commit only
  a curated set of images to `docs/screenshots/` when documenting UI changes.

---

## Git & workflow etiquette

- **Branch base matters.** The current UI (Tailwind v4 + shadcn) lives on
  `cursor/shadcn-ui-migration-153e`; older history on `master` predates that migration. Branch
  from the intended base and confirm if unsure.
- One logical change per commit; clear messages. For perf commits, include measured impact, e.g.
  `perf: lazy-load PdfViewer — initial JS 254→X kB gzip`.
- **No force-push, no amending pushed commits.** Push regularly. Keep PRs in **draft** until a
  human asks to mark ready/merge. **Never merge or deploy without explicit approval.**

---

## Common pitfalls (quick checklist)

- [ ] Ran `npm install` **without** `--legacy-peer-deps` → install fails. Use the flag.
- [ ] Hand-edited `src/data/acs-codes.js` → it's auto-generated; regenerate instead.
- [ ] Statically imported a question bank → it leaks into the main chunk. Keep `src/data/**` lazy.
- [ ] Hardcoded a color or added a gradient → use semantic tokens; design stays flat.
- [ ] Changed `q.c`/`id` conventions or topic IDs → breaks scoring/tests. Don't.
- [ ] Content hidden behind the fixed `TabBar` → wrap in `<Screen>`.
- [ ] Skipped `npm run visual-check` after a UI change, or only checked one theme.
- [ ] Broke the `App.jsx` `tab`/`screen` contract or passed wrong props to a screen.
- [ ] Removed `'wasm-unsafe-eval'` from the CSP → pdfjs breaks.

---

## Further reading

- `docs/superpowers/specs/*` and `docs/superpowers/plans/*` — dated design specs/plans (plans use
  `- [ ]` checkboxes).
- `docs/screenshots/README.md` — indexed UI screenshots (light/dark, mobile/desktop).
- `docs/question-audit.md` — question-bank audit notes.
