export default function Pneudraulics() {
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
        Pneudraulic System (Emergency)
      </text>

      {/* Nitrogen Bottle */}
      <rect x="15" y="50" width="70" height="80" rx="20"
        style={{ fill: 'none', stroke: line, strokeWidth: 2.5 }} />
      <text x="50" y="85" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        N&#8322;
      </text>
      <text x="50" y="98" textAnchor="middle" style={{ fill: text, fontSize: 8 }}>
        BOTTLE
      </text>
      {/* Pressure indicator */}
      <text x="50" y="115" textAnchor="middle" style={{ fill: secondary, fontSize: 7 }}>
        (compressed)
      </text>

      {/* Arrow: N2 gas pushing */}
      <line x1="85" y1="90" x2="135" y2="90"
        style={{ stroke: accent, strokeWidth: 2.5 }} />
      <polygon points="131,84 141,90 131,96" style={{ fill: accent }} />
      <text x="110" y="82" textAnchor="middle" style={{ fill: accent, fontSize: 9, fontWeight: 'bold' }}>
        N&#8322; gas
      </text>

      {/* Hydraulic Fluid reservoir */}
      <rect x="142" y="55" width="90" height="70" rx="6"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      {/* Fluid fill */}
      <rect x="144" y="75" width="86" height="48" rx="4"
        style={{ fill: secondary, opacity: 0.15 }} />
      <text x="187" y="80" textAnchor="middle" style={{ fill: text, fontSize: 9, fontWeight: 'bold' }}>
        HYDRAULIC
      </text>
      <text x="187" y="92" textAnchor="middle" style={{ fill: text, fontSize: 9, fontWeight: 'bold' }}>
        FLUID
      </text>
      {/* Gas pushing on fluid */}
      <text x="187" y="68" textAnchor="middle" style={{ fill: secondary, fontSize: 7, fontStyle: 'italic' }}>
        gas above
      </text>

      {/* Arrow: fluid to actuator */}
      <line x1="232" y1="90" x2="282" y2="90"
        style={{ stroke: accent, strokeWidth: 2.5 }} />
      <polygon points="278,84 288,90 278,96" style={{ fill: accent }} />
      <text x="257" y="82" textAnchor="middle" style={{ fill: secondary, fontSize: 9 }}>
        fluid
      </text>

      {/* Actuator */}
      <rect x="290" y="50" width="110" height="80" rx="6"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="345" y="80" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        ACTUATOR
      </text>
      <text x="345" y="95" textAnchor="middle" style={{ fill: secondary, fontSize: 9 }}>
        (Gear / Brake)
      </text>
      <text x="345" y="118" textAnchor="middle" style={{ fill: secondary, fontSize: 8 }}>
        EXTENDS
      </text>

      {/* Flow chain arrows label */}
      <text x="210" y="145" textAnchor="middle" style={{ fill: text, fontSize: 10 }}>
        Nitrogen pushes hydraulic fluid to actuators
      </text>

      {/* Key specs */}
      <text x="210" y="165" textAnchor="middle" style={{ fill: accent, fontSize: 11, fontWeight: 'bold' }}>
        ~3,100 psi at 70°F
      </text>
      <text x="210" y="182" textAnchor="middle" style={{ fill: text, fontSize: 10 }}>
        Enough for ONE gear extension
      </text>
      <text x="210" y="198" textAnchor="middle" style={{ fill: secondary, fontSize: 9, fontStyle: 'italic' }}>
        One-shot emergency system — not reusable in flight
      </text>
    </svg>
  )
}
