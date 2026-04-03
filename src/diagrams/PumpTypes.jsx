export default function PumpTypes() {
  const line = 'var(--color-diagram-line)'
  const text = 'var(--color-diagram-text)'
  const secondary = 'var(--color-diagram-secondary)'
  const accent = 'var(--color-accent)'

  return (
    <svg viewBox="0 0 420 210" style={{
      width: '100%',
      maxWidth: 420,
      background: 'var(--color-diagram-bg)',
      borderRadius: 8,
      padding: 8,
      margin: '0 auto',
      display: 'block',
    }}>
      {/* Title */}
      <text x="210" y="20" textAnchor="middle" style={{ fill: text, fontSize: 14, fontWeight: 'bold' }}>
        Pump Types Comparison
      </text>

      {/* Left box: Constant Delivery */}
      <rect x="15" y="35" width="185" height="145" rx="6"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <rect x="15" y="35" width="185" height="28" rx="6"
        style={{ fill: secondary, opacity: 0.1 }} />
      {/* Clip bottom corners of header */}
      <rect x="15" y="50" width="185" height="13"
        style={{ fill: secondary, opacity: 0.1 }} />
      <text x="107" y="54" textAnchor="middle" style={{ fill: accent, fontSize: 12, fontWeight: 'bold' }}>
        Constant Delivery
      </text>

      <text x="30" y="82" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        Fixed output volume
      </text>
      <circle cx="24" cy="79" r="2" style={{ fill: secondary }} />

      <text x="30" y="100" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        Pressure regulator
      </text>
      <text x="30" y="112" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        controls pressure
      </text>
      <circle cx="24" cy="97" r="2" style={{ fill: secondary }} />

      <text x="30" y="132" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        + Relief valve backup
      </text>
      <circle cx="24" cy="129" r="2" style={{ fill: secondary }} />

      <text x="30" y="155" textAnchor="start" style={{ fill: secondary, fontSize: 9, fontStyle: 'italic' }}>
        Excess fluid returns
      </text>
      <text x="30" y="167" textAnchor="start" style={{ fill: secondary, fontSize: 9, fontStyle: 'italic' }}>
        to reservoir
      </text>

      {/* Right box: Variable Displacement */}
      <rect x="220" y="35" width="185" height="145" rx="6"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <rect x="220" y="35" width="185" height="28" rx="6"
        style={{ fill: secondary, opacity: 0.1 }} />
      <rect x="220" y="50" width="185" height="13"
        style={{ fill: secondary, opacity: 0.1 }} />
      <text x="312" y="54" textAnchor="middle" style={{ fill: accent, fontSize: 12, fontWeight: 'bold' }}>
        Variable Displacement
      </text>

      <text x="235" y="82" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        Adjustable output volume
      </text>
      <circle cx="229" cy="79" r="2" style={{ fill: secondary }} />

      <text x="235" y="100" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        Internal compensator
      </text>
      <text x="235" y="112" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        controls pressure
      </text>
      <circle cx="229" cy="97" r="2" style={{ fill: secondary }} />

      <text x="235" y="132" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        + Relief valve backup
      </text>
      <circle cx="229" cy="129" r="2" style={{ fill: secondary }} />

      <text x="235" y="155" textAnchor="start" style={{ fill: secondary, fontSize: 9, fontStyle: 'italic' }}>
        Reduces output when
      </text>
      <text x="235" y="167" textAnchor="start" style={{ fill: secondary, fontSize: 9, fontStyle: 'italic' }}>
        demand is low
      </text>

      {/* VS divider */}
      <text x="210" y="112" textAnchor="middle" style={{ fill: secondary, fontSize: 12, fontWeight: 'bold' }}>
        vs
      </text>

      {/* Bottom note */}
      <text x="210" y="198" textAnchor="middle" style={{ fill: secondary, fontSize: 9 }}>
        Both types use relief valves as safety backup
      </text>
    </svg>
  )
}
