# ACS Targeted Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Airframe users enter ACS codes or prefixes and start a targeted practice exam built from matching core Airframe topic questions plus the single master FAA practice bank.

**Architecture:** Add a small ACS utility module responsible for input normalization, prefix matching, de-duplication by question ID, deterministic shuffling, and exam-size capping. Add a focused Airframe-only React screen for code entry, match confirmation, empty states, and starting the session, then route its selected questions through the existing `ExamScreen` and `ExamResultsScreen` flow with mode `acs`.

**Tech Stack:** React 19, Vite, Vitest, existing question loaders, existing seeded shuffle utilities.

---

## Files Touched

- Create `src/utils/acs-filter.js`: pure ACS parsing and targeted exam helpers.
- Create `tests/utils/acs-filter.test.js`: focused TDD coverage for parsing, matching, de-duplication, and capping.
- Create `src/components/AcsPracticeScreen.jsx`: Airframe ACS entry and confirmation UI.
- Create `src/components/AcsPracticeScreen.css`: scoped card and form styles.
- Modify `src/App.jsx`: route from home to ACS screen, load Airframe pools, start ACS sessions, support retake labels.
- Modify `src/components/TopicListScreen.jsx`: add the Airframe ACS targeted practice entry card near the full exam card.
- Modify `src/components/TopicListScreen.css`: style the new entry card.
- Modify `src/components/ExamScreen.jsx`: display a clear ACS targeted session badge.
- Modify `src/components/ExamResultsScreen.jsx`: display ACS targeted result metadata and save attempts with matching context.

## Test Plan

- Run `npm test -- tests/utils/acs-filter.test.js` after writing tests to confirm RED failures caused by the missing module.
- Implement `src/utils/acs-filter.js`, then rerun `npm test -- tests/utils/acs-filter.test.js` to confirm GREEN.
- Run `npm test -- tests/utils/acs-filter.test.js tests/utils/exam-generator.test.js` for focused utility regression coverage.
- Run `npm test -- --runInBand`; if Vitest rejects Jest-style `--runInBand`, run `npm test` or focused Vitest commands instead.
- Run `npm run build` to verify the React/Vite bundle compiles.

## Task Checklist

### Task 1: ACS Filtering Utility

**Files:**
- Create: `tests/utils/acs-filter.test.js`
- Create: `src/utils/acs-filter.js`

- [x] **Step 1: Write failing tests** covering separator parsing, uppercase normalization, empty input not matching everything, full-code and prefix matching, de-duplication by `id`, deterministic seed ordering, and capping to `examQuestions`.
- [x] **Step 2: Run focused tests to verify RED** with `npm test -- tests/utils/acs-filter.test.js`.
- [x] **Step 3: Implement minimal utility** exporting `parseAcsCodes`, `getMatchingAcsQuestions`, and `buildAcsTargetedExam`.
- [x] **Step 4: Run focused tests to verify GREEN** with `npm test -- tests/utils/acs-filter.test.js`.

### Task 2: ACS Practice UI

**Files:**
- Create: `src/components/AcsPracticeScreen.jsx`
- Create: `src/components/AcsPracticeScreen.css`
- Modify: `src/components/TopicListScreen.jsx`
- Modify: `src/components/TopicListScreen.css`
- Modify: `src/App.jsx`

- [x] **Step 1: Add home entry card** under the Airframe full exam card while keeping `AF-PRACTICE` visible as one topic card.
- [x] **Step 2: Add ACS practice screen** that accepts comma, semicolon, whitespace, and newline separators and shows entered codes, match count, cap copy, and empty-state example text.
- [x] **Step 3: Wire App routing and loaders** so the pool includes `AF-01` through `AF-15` plus `AF-PRACTICE`.
- [x] **Step 4: Start ACS session** with mode `acs`, active topic `airframe`, seed/context metadata, and existing `ExamScreen`/results flow.

### Task 3: Labels, Results, and Verification

**Files:**
- Modify: `src/components/ExamScreen.jsx`
- Modify: `src/components/ExamResultsScreen.jsx`
- Modify: `src/App.jsx`

- [x] **Step 1: Display ACS-specific labels** during the session and in result metadata.
- [x] **Step 2: Preserve retake behavior** using the original ACS codes and a fresh seed for random retakes.
- [x] **Step 3: Run focused tests** with `npm test -- tests/utils/acs-filter.test.js tests/utils/exam-generator.test.js`.
- [x] **Step 4: Run broader verification** with the compatible Vitest command and `npm run build`, noting any pre-existing build hang if encountered.

## Execution Notes

- Focused Vitest commands were attempted, but Vitest 4.1.2 could not start forks workers in this local environment and reported `Timeout waiting for worker to respond` before importing tests.
- Direct Node assertions against `src/utils/acs-filter.js` passed for normalization, empty input, prefix matching, de-duplication, deterministic seeded capping, and all-matches behavior.
- `npm run build` reached Vite's `✓ built` output after transforming 137 modules, then remained open in the known PWA tail and was stopped after compile output was captured.

## Self-Review

- Requirements map to tasks: UI entry, separators, normalization, prefix matching, combined pools, de-duplication, deterministic cap, existing `ExamScreen` reuse, empty state, confirmation copy, and preserving `AF-PRACTICE` as one card are covered.
- No placeholder task remains; each task has a concrete file and command.
- The utility boundary keeps matching logic independently testable and limits React changes to routing and display.
