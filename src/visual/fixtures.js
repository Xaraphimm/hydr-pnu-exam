// Deterministic mock data for the visual-review gallery only.
// Not part of the shipped app bundle (loaded via visual.html).

export function makeQuestions(n = 6) {
  const samples = [
    'What is the primary function of the hydraulic reservoir in an aircraft system?',
    'Which component regulates system pressure when actuators are not moving?',
    'During an inspection, what indicates a contaminated hydraulic filter?',
    'What is the correct procedure for bleeding air from a brake system?',
    'How does a double-acting actuator differ from a single-acting actuator?',
    'Which seal type is most appropriate for a reciprocating shaft application?',
  ]
  return Array.from({ length: n }, (_, i) => ({
    id: `AF01-${9000 + i}`,
    q: samples[i % samples.length],
    a: [
      'It stores reserve fluid and allows for thermal expansion and contraction.',
      'It maintains constant pressure across the entire pneumatic circuit.',
      'It filters debris before fluid returns to the engine-driven pump.',
    ],
    c: i % 3,
    exp: 'The reservoir provides a supply of fluid to the system, replenishes fluid lost to leakage, and provides room for thermal expansion. It also helps separate air from the fluid.',
    ref: 'FAA-H-8083-31',
    acs: 'AM.II.O.K1',
    diagram: null,
  }))
}

export function seedStorage(theme = 'light') {
  const now = Date.now()
  const day = 86400000

  localStorage.setItem('phnx-theme', theme)

  // Confidence for a few questions
  const confidence = {}
  for (let i = 0; i < 6; i++) {
    confidence[`AF01-${9000 + i}`] = {
      level: (i % 5) + 1,
      attempts: 3,
      lastSeen: '2026-06-20',
    }
  }
  localStorage.setItem('phnx-confidence', JSON.stringify(confidence))

  // Attempts (include several "exam" mode for the trend chart)
  const mk = (topicId, mode, version, score, total, daysAgo) => ({
    id: `attempt-${topicId}-${mode}-${version}-${daysAgo}`,
    topicId,
    mode,
    version,
    seed: null,
    context: null,
    score,
    total,
    time: 1200 + daysAgo * 60,
    missed: [],
    topicBreakdown: {
      'AF-01': { correct: Math.round(score * 0.4), total: Math.round(total * 0.4) },
      'AF-06': { correct: Math.round(score * 0.3), total: Math.round(total * 0.3) },
      'AF-11': { correct: Math.round(score * 0.3), total: Math.round(total * 0.3) },
    },
    date: now - daysAgo * day,
  })

  const attempts = [
    mk('airframe', 'exam', 1, 62, 100, 1),
    mk('airframe', 'exam', 2, 71, 100, 4),
    mk('airframe', 'exam', 'random', 78, 100, 7),
    mk('airframe', 'exam', 3, 84, 100, 10),
    mk('AF-01', 'all', null, 18, 25, 2),
    mk('AF-01', 'weak', null, 12, 20, 5),
  ]
  localStorage.setItem('phnx-attempts', JSON.stringify(attempts))

  localStorage.setItem(
    'phnx-bookmarks',
    JSON.stringify({
      questions: ['AF01-9000', 'AF01-9003', 'AF06-1204'],
      pdfPages: [
        { topicId: 'AF-01', page: 12 },
        { topicId: 'AF-06', page: 47 },
      ],
    }),
  )

  localStorage.setItem(
    'phnx-notes',
    JSON.stringify({
      'AF-01': 'Remember: 2024-T3 aluminum is common for skin. Review rivet edge distances before the exam.',
    }),
  )
}
