export default function CylinderCalc() {
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
        Cylinder Calculations
      </text>

      {/* Circle cross-section */}
      <circle cx="100" cy="100" r="55"
        style={{ fill: 'none', stroke: line, strokeWidth: 2.5 }} />

      {/* Radius line */}
      <line x1="100" y1="100" x2="155" y2="100"
        style={{ stroke: accent, strokeWidth: 2 }} />
      {/* Radius dot at center */}
      <circle cx="100" cy="100" r="3" style={{ fill: accent }} />
      {/* Radius label */}
      <text x="128" y="93" textAnchor="middle" style={{ fill: accent, fontSize: 11, fontWeight: 'bold' }}>
        r
      </text>

      {/* Diameter line (dashed) */}
      <line x1="45" y1="100" x2="155" y2="100"
        style={{ stroke: secondary, strokeWidth: 1, strokeDasharray: '3,2' }} />
      <text x="100" y="118" textAnchor="middle" style={{ fill: secondary, fontSize: 9 }}>
        d = 2r
      </text>

      {/* Cross-section label */}
      <text x="100" y="172" textAnchor="middle" style={{ fill: secondary, fontSize: 10, fontStyle: 'italic' }}>
        Cross-Section
      </text>

      {/* Formulas on the right side */}
      <text x="240" y="55" textAnchor="start" style={{ fill: text, fontSize: 12, fontWeight: 'bold' }}>
        Formulas:
      </text>

      {/* Area formula - highlighted */}
      <text x="240" y="78" textAnchor="start" style={{ fill: accent, fontSize: 12, fontWeight: 'bold' }}>
        A = π x r²
      </text>

      {/* Force formula */}
      <text x="240" y="100" textAnchor="start" style={{ fill: text, fontSize: 12 }}>
        F = P x A
      </text>

      {/* Pressure formula */}
      <text x="240" y="122" textAnchor="start" style={{ fill: text, fontSize: 12 }}>
        P = F / A
      </text>

      {/* Area from force formula */}
      <text x="240" y="144" textAnchor="start" style={{ fill: text, fontSize: 12 }}>
        A = F / P
      </text>

      {/* Volume formula */}
      <text x="240" y="166" textAnchor="start" style={{ fill: text, fontSize: 12 }}>
        Vol = A x stroke
      </text>

      {/* Divider */}
      <line x1="230" y1="42" x2="230" y2="180"
        style={{ stroke: secondary, strokeWidth: 1, opacity: 0.3 }} />

      {/* Key */}
      <text x="200" y="205" textAnchor="middle" style={{ fill: secondary, fontSize: 10 }}>
        F = Force (lbs) | P = Pressure (psi) | A = Area (in²)
      </text>
      <text x="200" y="220" textAnchor="middle" style={{ fill: secondary, fontSize: 10 }}>
        r = radius (in) | stroke = piston travel (in)
      </text>
    </svg>
  )
}
