export default function TrendChart({ attempts }) {
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
  const threshY = PAD_T + chartH - (70 / 100) * chartH

  return (
    <div className="rounded-xl border bg-card p-3 shadow-sm">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {[0, 25, 50, 75, 100].map(v => {
          const y = PAD_T + chartH - (v / 100) * chartH
          return (
            <text key={v} x={PAD_L - 6} y={y + 4} className="fill-muted-foreground text-[10px]" textAnchor="end">
              {v}%
            </text>
          )
        })}

        {[0, 25, 50, 75, 100].map(v => {
          const y = PAD_T + chartH - (v / 100) * chartH
          return (
            <line key={v} x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} className="stroke-border" strokeWidth="1" />
          )
        })}

        <line
          x1={PAD_L}
          y1={threshY}
          x2={W - PAD_R}
          y2={threshY}
          className="stroke-success"
          strokeWidth="1"
          strokeDasharray="4 3"
        />

        <polyline points={polyline} className="stroke-primary" fill="none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} className="fill-primary" />
        ))}

        {points.map((p, i) => (
          <text key={i} x={p.x} y={H - 4} className="fill-muted-foreground text-[10px]" textAnchor="middle">
            {i + 1}
          </text>
        ))}
      </svg>
    </div>
  )
}
