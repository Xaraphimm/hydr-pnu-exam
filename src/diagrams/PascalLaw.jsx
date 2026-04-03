export default function PascalLaw() {
  const line = 'var(--color-diagram-line)'
  const text = 'var(--color-diagram-text)'
  const secondary = 'var(--color-diagram-secondary)'
  const accent = 'var(--color-accent)'

  return (
    <svg viewBox="0 0 400 220" style={{
      width: '100%',
      maxWidth: 400,
      background: 'var(--color-diagram-bg)',
      borderRadius: 8,
      padding: 8,
      margin: '0 auto',
      display: 'block',
    }}>
      {/* Title */}
      <text x="200" y="22" textAnchor="middle" style={{ fill: text, fontSize: 14, fontWeight: 'bold' }}>
        P = F / A (Pascal's Law)
      </text>

      {/* Connecting fluid tube */}
      <rect x="80" y="120" width="240" height="30" rx="4"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      {/* Fluid fill */}
      <rect x="81" y="121" width="238" height="28" rx="3"
        style={{ fill: secondary, opacity: 0.2 }} />

      {/* Small cylinder (left) */}
      <rect x="60" y="55" width="50" height="70" rx="3"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      {/* Small piston */}
      <rect x="62" y="70" width="46" height="10" rx="2"
        style={{ fill: secondary, strokeWidth: 0 }} />

      {/* F1 arrow (down onto small piston) */}
      <line x1="85" y1="38" x2="85" y2="68"
        style={{ stroke: accent, strokeWidth: 2.5 }} />
      <polygon points="79,64 85,74 91,64"
        style={{ fill: accent }} />
      <text x="85" y="35" textAnchor="middle" style={{ fill: accent, fontSize: 11, fontWeight: 'bold' }}>
        F1 (small)
      </text>

      {/* A1 label */}
      <text x="85" y="100" textAnchor="middle" style={{ fill: text, fontSize: 10 }}>
        A1
      </text>
      <line x1="62" y1="105" x2="108" y2="105"
        style={{ stroke: secondary, strokeWidth: 1, strokeDasharray: '3,2' }} />
      <text x="85" y="115" textAnchor="middle" style={{ fill: secondary, fontSize: 9 }}>
        (small area)
      </text>

      {/* Large cylinder (right) */}
      <rect x="270" y="35" width="90" height="90" rx="3"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      {/* Large piston */}
      <rect x="272" y="55" width="86" height="12" rx="2"
        style={{ fill: secondary, strokeWidth: 0 }} />

      {/* F2 arrow (down onto large piston) */}
      <line x1="315" y1="22" x2="315" y2="52"
        style={{ stroke: accent, strokeWidth: 2.5 }} />
      <polygon points="309,48 315,58 321,48"
        style={{ fill: accent }} />
      <text x="315" y="18" textAnchor="middle" style={{ fill: accent, fontSize: 11, fontWeight: 'bold' }}>
        F2 (large)
      </text>

      {/* A2 label */}
      <text x="315" y="85" textAnchor="middle" style={{ fill: text, fontSize: 10 }}>
        A2
      </text>
      <line x1="272" y1="92" x2="358" y2="92"
        style={{ stroke: secondary, strokeWidth: 1, strokeDasharray: '3,2' }} />
      <text x="315" y="102" textAnchor="middle" style={{ fill: secondary, fontSize: 9 }}>
        (large area)
      </text>

      {/* Fluid label */}
      <text x="200" y="139" textAnchor="middle" style={{ fill: secondary, fontSize: 10, fontStyle: 'italic' }}>
        FLUID (incompressible)
      </text>

      {/* Formula note */}
      <text x="200" y="170" textAnchor="middle" style={{ fill: text, fontSize: 11 }}>
        P1 = P2 &rarr; F1/A1 = F2/A2
      </text>
      <text x="200" y="185" textAnchor="middle" style={{ fill: secondary, fontSize: 10 }}>
        Small force on small area = Large force on large area
      </text>

      {/* Flow arrows in tube */}
      <polygon points="160,132 170,135 160,138"
        style={{ fill: accent, opacity: 0.7 }} />
      <polygon points="210,132 220,135 210,138"
        style={{ fill: accent, opacity: 0.7 }} />
    </svg>
  )
}
