import { spawn } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const PORT = 5181
const BASE = `http://127.0.0.1:${PORT}/hydr-pnu-exam/visual.html`
const OUT = resolve(root, 'artifacts/screens')

const SCREENS = [
  'topic-list',
  'subtopic',
  'exam-select',
  'acs-practice',
  'test',
  'mock',
  'results',
  'exam-results',
  'flashcards',
  'flashcard-complete',
  'history',
  'progress',
  'search',
  'bookmarks',
]

const THEMES = ['light', 'dark']
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
]

// Only capture this subset (comma separated) if provided
const only = process.argv[2] ? process.argv[2].split(',') : null
const screens = only ? SCREENS.filter((s) => only.includes(s)) : SCREENS

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now()
  return new Promise((res, rej) => {
    const tick = async () => {
      try {
        const r = await fetch(url)
        if (r.ok) return res()
      } catch {
        // not up yet
      }
      if (Date.now() - start > timeoutMs) return rej(new Error('server timeout'))
      setTimeout(tick, 400)
    }
    tick()
  })
}

async function main() {
  rmSync(OUT, { recursive: true, force: true })
  mkdirSync(OUT, { recursive: true })

  const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
    cwd: root,
    stdio: 'ignore',
  })

  let browser
  try {
    await waitForServer(`http://127.0.0.1:${PORT}/hydr-pnu-exam/visual.html?screen=topic-list&theme=light`)
    browser = await chromium.launch()

    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      })
      for (const theme of THEMES) {
        for (const screen of screens) {
          const page = await context.newPage()
          const url = `${BASE}?screen=${screen}&theme=${theme}`
          await page.goto(url, { waitUntil: 'networkidle' })
          await page.waitForTimeout(500)
          const file = resolve(OUT, `${screen}__${theme}__${vp.name}.png`)
          await page.screenshot({ path: file, fullPage: true })
          await page.close()
          console.log(`captured ${screen} ${theme} ${vp.name}`)
        }
      }
      await context.close()
    }
  } finally {
    if (browser) await browser.close()
    vite.kill('SIGTERM')
  }
  console.log(`\nScreenshots written to ${OUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
