export default function PneumaticBrakeValve() {
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
        Pneumatic Brake Control Valve
      </text>

      {/* Housing */}
      <rect x="80" y="40" width="220" height="130" rx="10"
        style={{ fill: 'none', stroke: line, strokeWidth: 2.5 }} />
      <text x="190" y="58" textAnchor="middle" style={{ fill: secondary, fontSize: 9, fontStyle: 'italic' }}>
        3-PORT HOUSING
      </text>

      {/* Left poppet valve (L) */}
      <circle cx="150" cy="105" r="28"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="150" y="100" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        L
      </text>
      <text x="150" y="113" textAnchor="middle" style={{ fill: secondary, fontSize: 8 }}>
        POPPET
      </text>
      {/* Poppet seat indicator */}
      <line x1="135" y1="120" x2="165" y2="120"
        style={{ stroke: secondary, strokeWidth: 1, strokeDasharray: '2,2' }} />

      {/* Right poppet valve (R) */}
      <circle cx="240" cy="105" r="28"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="240" y="100" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        R
      </text>
      <text x="240" y="113" textAnchor="middle" style={{ fill: secondary, fontSize: 8 }}>
        POPPET
      </text>
      {/* Poppet seat indicator */}
      <line x1="225" y1="120" x2="255" y2="120"
        style={{ stroke: secondary, strokeWidth: 1, strokeDasharray: '2,2' }} />

      {/* Connection between poppets */}
      <line x1="178" y1="105" x2="212" y2="105"
        style={{ stroke: secondary, strokeWidth: 1.5, strokeDasharray: '3,2' }} />

      {/* PRESSURE input (left side) */}
      <line x1="20" y1="105" x2="78" y2="105"
        style={{ stroke: accent, strokeWidth: 2.5 }} />
      <polygon points="74,99 84,105 74,111" style={{ fill: accent }} />
      <text x="50" y="96" textAnchor="middle" style={{ fill: accent, fontSize: 10, fontWeight: 'bold' }}>
        PRESSURE
      </text>
      <text x="50" y="120" textAnchor="middle" style={{ fill: secondary, fontSize: 8 }}>
        (from pedal)
      </text>

      {/* TO BRAKES output (top right) */}
      <line x1="270" y1="78" x2="270" y2="45"
        style={{ stroke: line, strokeWidth: 2 }} />
      <line x1="270" y1="45" x2="360" y2="45"
        style={{ stroke: line, strokeWidth: 2 }} />
      <polygon points="356,39 366,45 356,51" style={{ fill: line }} />
      <text x="340" y="37" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        TO BRAKES
      </text>

      {/* VENT output (bottom right) */}
      <line x1="270" y1="133" x2="270" y2="165"
        style={{ stroke: secondary, strokeWidth: 2 }} />
      <line x1="270" y1="165" x2="360" y2="165"
        style={{ stroke: secondary, strokeWidth: 2 }} />
      <polygon points="356,159 366,165 356,171" style={{ fill: secondary }} />
      <text x="340" y="157" textAnchor="middle" style={{ fill: secondary, fontSize: 10, fontWeight: 'bold' }}>
        VENT
      </text>
      <text x="340" y="180" textAnchor="middle" style={{ fill: secondary, fontSize: 8 }}>
        (to atmosphere)
      </text>

      {/* Port labels */}
      <circle cx="80" cy="105" r="3" style={{ fill: accent }} />
      <circle cx="270" cy="45" r="3" style={{ fill: line }} />
      <circle cx="270" cy="165" r="3" style={{ fill: secondary }} />

      {/* Note */}
      <text x="200" y="195" textAnchor="middle" style={{ fill: text, fontSize: 11 }}>
        3-port housing with 2 poppet valves
      </text>
      <text x="200" y="212" textAnchor="middle" style={{ fill: secondary, fontSize: 9 }}>
        Pedal pressure opens L poppet (air to brakes), closes R poppet (seals vent)
      </text>
      <text x="200" y="225" textAnchor="middle" style={{ fill: secondary, fontSize: 9 }}>
        Release pedal: L closes, R opens (brakes vent to atmosphere)
      </text>
    </svg>
  )
}
