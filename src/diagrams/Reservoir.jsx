export default function Reservoir() {
  const line = 'var(--color-diagram-line)'
  const text = 'var(--color-diagram-text)'
  const secondary = 'var(--color-diagram-secondary)'
  const accent = 'var(--color-accent)'

  return (
    <svg viewBox="0 0 380 260" style={{
      width: '100%',
      maxWidth: 380,
      background: 'var(--color-diagram-bg)',
      borderRadius: 8,
      padding: 8,
      margin: '0 auto',
      display: 'block',
    }}>
      {/* Title */}
      <text x="190" y="20" textAnchor="middle" style={{ fill: text, fontSize: 14, fontWeight: 'bold' }}>
        Hydraulic Reservoir
      </text>

      {/* Tank outline */}
      <rect x="60" y="35" width="200" height="170" rx="6"
        style={{ fill: 'none', stroke: line, strokeWidth: 2.5 }} />

      {/* Air space (top portion) */}
      <rect x="62" y="37" width="196" height="45" rx="4"
        style={{ fill: secondary, opacity: 0.08 }} />
      <text x="160" y="62" textAnchor="middle" style={{ fill: secondary, fontSize: 10, fontStyle: 'italic' }}>
        AIR SPACE
      </text>

      {/* Fluid level line */}
      <line x1="62" y1="82" x2="258" y2="82"
        style={{ stroke: line, strokeWidth: 1.5, strokeDasharray: '6,3' }} />

      {/* Fluid fill */}
      <rect x="62" y="83" width="196" height="120" rx="4"
        style={{ fill: secondary, opacity: 0.15 }} />
      <text x="160" y="165" textAnchor="middle" style={{ fill: text, fontSize: 11 }}>
        FLUID
      </text>

      {/* Standpipe - vertical pipe from mid-level up through air space */}
      <rect x="100" y="42" width="10" height="95" rx="1"
        style={{ fill: 'none', stroke: accent, strokeWidth: 2 }} />
      {/* Standpipe opening at mid-fluid level */}
      <line x1="95" y1="137" x2="115" y2="137"
        style={{ stroke: accent, strokeWidth: 2 }} />
      <line x1="100" y1="137" x2="100" y2="120"
        style={{ stroke: accent, strokeWidth: 2 }} />
      <line x1="110" y1="137" x2="110" y2="120"
        style={{ stroke: accent, strokeWidth: 2 }} />

      {/* Standpipe outlet going out top-right */}
      <line x1="110" y1="42" x2="110" y2="30"
        style={{ stroke: accent, strokeWidth: 2 }} />
      <line x1="110" y1="30" x2="300" y2="30"
        style={{ stroke: accent, strokeWidth: 2 }} />
      <polygon points="296,25 306,30 296,35" style={{ fill: accent }} />

      {/* Standpipe label */}
      <text x="290" y="22" textAnchor="end" style={{ fill: accent, fontSize: 9, fontWeight: 'bold' }}>
        STANDPIPE
      </text>
      <text x="310" y="45" textAnchor="start" style={{ fill: text, fontSize: 9 }}>
        Main System
      </text>
      <text x="310" y="56" textAnchor="start" style={{ fill: text, fontSize: 9 }}>
        TO MAIN PUMP
      </text>

      {/* Emergency reserve zone (below standpipe inlet) */}
      <line x1="70" y1="137" x2="92" y2="137"
        style={{ stroke: secondary, strokeWidth: 1, strokeDasharray: '3,2' }} />
      <line x1="118" y1="137" x2="250" y2="137"
        style={{ stroke: secondary, strokeWidth: 1, strokeDasharray: '3,2' }} />
      <text x="200" y="152" textAnchor="middle" style={{ fill: secondary, fontSize: 9, fontStyle: 'italic' }}>
        EMERGENCY RESERVE
      </text>
      <text x="200" y="163" textAnchor="middle" style={{ fill: secondary, fontSize: 8 }}>
        (below standpipe intake)
      </text>

      {/* Bottom outlet */}
      <line x1="200" y1="205" x2="200" y2="230"
        style={{ stroke: line, strokeWidth: 2 }} />
      <polygon points="195,226 200,236 205,226" style={{ fill: line }} />
      <text x="200" y="250" textAnchor="middle" style={{ fill: text, fontSize: 9, fontWeight: 'bold' }}>
        BOTTOM OUTLET (Emergency)
      </text>
    </svg>
  )
}
