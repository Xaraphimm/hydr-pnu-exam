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
