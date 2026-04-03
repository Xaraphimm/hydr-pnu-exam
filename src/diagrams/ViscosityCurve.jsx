export default function ViscosityCurve() {
  const line = 'var(--color-diagram-line)'
  const text = 'var(--color-diagram-text)'
  const secondary = 'var(--color-diagram-secondary)'
  const accent = 'var(--color-accent)'

  return (
    <svg viewBox="0 0 400 230" style={{
      width: '100%',
      maxWidth: 400,
      background: 'var(--color-diagram-bg)',
      borderRadius: 8,
      padding: 8,
      margin: '0 auto',
      display: 'block',
    }}>
      {/* Title */}
      <text x="200" y="20" textAnchor="middle" style={{ fill: text, fontSize: 14, fontWeight: 'bold' }}>
        Viscosity vs Temperature
      </text>

      {/* Y axis */}
      <line x1="70" y1="40" x2="70" y2="180"
        style={{ stroke: line, strokeWidth: 2 }} />
      {/* Y axis arrow */}
      <polygon points="65,44 70,34 75,44" style={{ fill: line }} />
      {/* Y axis label */}
      <text x="30" y="110" textAnchor="middle"
        style={{ fill: text, fontSize: 11, fontWeight: 'bold' }}
        transform="rotate(-90, 30, 110)">
        Viscosity
      </text>

      {/* X axis */}
      <line x1="70" y1="180" x2="370" y2="180"
        style={{ stroke: line, strokeWidth: 2 }} />
      {/* X axis arrow */}
      <polygon points="366,175 376,180 366,185" style={{ fill: line }} />
      {/* X axis label */}
      <text x="220" y="200" textAnchor="middle" style={{ fill: text, fontSize: 11, fontWeight: 'bold' }}>
        Temperature
      </text>

      {/* Curve: high viscosity at low temp, low viscosity at high temp */}
      <path d="M 80,55 C 120,58 160,100 220,140 C 260,158 320,168 360,172"
        style={{ fill: 'none', stroke: accent, strokeWidth: 2.5 }} />

      {/* Cold = Thick label (upper left) */}
      <rect x="82" y="44" width="80" height="22" rx="4"
        style={{ fill: secondary, opacity: 0.1 }} />
      <text x="122" y="59" textAnchor="middle" style={{ fill: accent, fontSize: 10, fontWeight: 'bold' }}>
        Cold = Thick
      </text>
      {/* Pointer dot */}
      <circle cx="85" cy="55" r="4" style={{ fill: accent }} />

      {/* Hot = Thin label (lower right) */}
      <rect x="280" y="148" width="72" height="22" rx="4"
        style={{ fill: secondary, opacity: 0.1 }} />
      <text x="316" y="163" textAnchor="middle" style={{ fill: accent, fontSize: 10, fontWeight: 'bold' }}>
        Hot = Thin
      </text>
      {/* Pointer dot */}
      <circle cx="355" cy="171" r="4" style={{ fill: accent }} />

      {/* Gridlines (subtle) */}
      <line x1="70" y1="90" x2="370" y2="90"
        style={{ stroke: secondary, strokeWidth: 0.5, opacity: 0.3, strokeDasharray: '4,4' }} />
      <line x1="70" y1="135" x2="370" y2="135"
        style={{ stroke: secondary, strokeWidth: 0.5, opacity: 0.3, strokeDasharray: '4,4' }} />
      <line x1="170" y1="40" x2="170" y2="180"
        style={{ stroke: secondary, strokeWidth: 0.5, opacity: 0.3, strokeDasharray: '4,4' }} />
      <line x1="270" y1="40" x2="270" y2="180"
        style={{ stroke: secondary, strokeWidth: 0.5, opacity: 0.3, strokeDasharray: '4,4' }} />

      {/* Note */}
      <text x="200" y="222" textAnchor="middle" style={{ fill: secondary, fontSize: 10 }}>
        Hydraulic fluid must maintain proper viscosity across operating temps
      </text>
    </svg>
  )
}
