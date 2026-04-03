export default function DoubleActingActuator() {
  const line = 'var(--color-diagram-line)'
  const text = 'var(--color-diagram-text)'
  const secondary = 'var(--color-diagram-secondary)'
  const accent = 'var(--color-accent)'

  return (
    <svg viewBox="0 0 400 180" style={{
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
        Double-Acting Actuator
      </text>

      {/* Cylinder body */}
      <rect x="50" y="50" width="250" height="70" rx="4"
        style={{ fill: 'none', stroke: line, strokeWidth: 2.5 }} />

      {/* Piston (vertical bar in middle) */}
      <rect x="185" y="52" width="8" height="66" rx="1"
        style={{ fill: secondary }} />

      {/* Rod extending right from piston through cylinder wall */}
      <rect x="193" y="78" width="140" height="14" rx="3"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="335" y="77" textAnchor="start" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        ROD
      </text>

      {/* Pressure side (left of piston) - highlighted */}
      <text x="115" y="75" textAnchor="middle" style={{ fill: accent, fontSize: 11, fontWeight: 'bold' }}>
        PRESSURE
      </text>
      <text x="115" y="88" textAnchor="middle" style={{ fill: accent, fontSize: 10 }}>
        SIDE
      </text>
      {/* Pressure arrows pushing right */}
      <polygon points="140,95 150,100 140,105" style={{ fill: accent, opacity: 0.7 }} />
      <polygon points="120,95 130,100 120,105" style={{ fill: accent, opacity: 0.7 }} />
      <polygon points="100,95 110,100 100,105" style={{ fill: accent, opacity: 0.7 }} />

      {/* Return side (right of piston, above rod) */}
      <text x="235" y="68" textAnchor="middle" style={{ fill: secondary, fontSize: 10 }}>
        RETURN
      </text>

      {/* Port A (left side, bottom) */}
      <line x1="90" y1="120" x2="90" y2="145"
        style={{ stroke: line, strokeWidth: 2 }} />
      <polygon points="85,140 90,150 95,140" style={{ fill: line }} />
      <text x="90" y="162" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        Port A
      </text>

      {/* Port B (right side, bottom) */}
      <line x1="260" y1="120" x2="260" y2="145"
        style={{ stroke: line, strokeWidth: 2 }} />
      <polygon points="255,140 260,150 265,140" style={{ fill: line }} />
      <text x="260" y="162" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        Port B
      </text>

      {/* Direction arrow */}
      <line x1="165" y1="42" x2="210" y2="42"
        style={{ stroke: accent, strokeWidth: 2 }} />
      <polygon points="206,37 216,42 206,47" style={{ fill: accent }} />
      <text x="190" y="38" textAnchor="middle" style={{ fill: secondary, fontSize: 8 }}>
        EXTEND
      </text>
    </svg>
  )
}
