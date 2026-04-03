export default function SealTypes() {
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
        Seal Types: Packing vs Gasket
      </text>

      {/* Left box: Packing */}
      <rect x="15" y="35" width="185" height="155" rx="6"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <rect x="15" y="35" width="185" height="28" rx="6"
        style={{ fill: secondary, opacity: 0.1 }} />
      <rect x="15" y="50" width="185" height="13"
        style={{ fill: secondary, opacity: 0.1 }} />
      <text x="107" y="54" textAnchor="middle" style={{ fill: accent, fontSize: 12, fontWeight: 'bold' }}>
        PACKING
      </text>

      {/* Packing icon: ring around a shaft */}
      <rect x="70" y="72" width="60" height="20" rx="3"
        style={{ fill: 'none', stroke: line, strokeWidth: 1.5 }} />
      <rect x="90" y="66" width="10" height="32" rx="2"
        style={{ fill: secondary, opacity: 0.3, stroke: line, strokeWidth: 1 }} />
      <text x="130" y="80" textAnchor="start" style={{ fill: secondary, fontSize: 8 }}>
        shaft
      </text>
      <line x1="125" y1="82" x2="102" y2="82"
        style={{ stroke: secondary, strokeWidth: 0.5 }} />
      {/* Motion arrow */}
      <line x1="95" y1="66" x2="95" y2="56"
        style={{ stroke: accent, strokeWidth: 1.5 }} />
      <polygon points="92,58 95,52 98,58" style={{ fill: accent }} />

      <text x="30" y="112" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        Seals MOVING parts
      </text>
      <circle cx="24" cy="109" r="2" style={{ fill: accent }} />

      <text x="30" y="130" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        One-way seal
      </text>
      <circle cx="24" cy="127" r="2" style={{ fill: secondary }} />

      <text x="30" y="148" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        Open end faces pressure
      </text>
      <circle cx="24" cy="145" r="2" style={{ fill: secondary }} />

      <text x="30" y="170" textAnchor="start" style={{ fill: secondary, fontSize: 9, fontStyle: 'italic' }}>
        e.g., O-rings, V-rings,
      </text>
      <text x="30" y="182" textAnchor="start" style={{ fill: secondary, fontSize: 9, fontStyle: 'italic' }}>
        U-cups on pistons/rods
      </text>

      {/* Right box: Gasket */}
      <rect x="220" y="35" width="185" height="155" rx="6"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <rect x="220" y="35" width="185" height="28" rx="6"
        style={{ fill: secondary, opacity: 0.1 }} />
      <rect x="220" y="50" width="185" height="13"
        style={{ fill: secondary, opacity: 0.1 }} />
      <text x="312" y="54" textAnchor="middle" style={{ fill: accent, fontSize: 12, fontWeight: 'bold' }}>
        GASKET
      </text>

      {/* Gasket icon: flat seal between two flanges */}
      <rect x="275" y="70" width="60" height="8" rx="1"
        style={{ fill: secondary, opacity: 0.3, stroke: line, strokeWidth: 1 }} />
      <rect x="275" y="80" width="60" height="4" rx="0"
        style={{ fill: accent, opacity: 0.5 }} />
      <rect x="275" y="86" width="60" height="8" rx="1"
        style={{ fill: secondary, opacity: 0.3, stroke: line, strokeWidth: 1 }} />
      <text x="340" y="83" textAnchor="start" style={{ fill: secondary, fontSize: 8 }}>
        gasket
      </text>

      <text x="235" y="112" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        Seals STATIONARY parts
      </text>
      <circle cx="229" cy="109" r="2" style={{ fill: accent }} />

      <text x="235" y="130" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        Two-way seal
      </text>
      <circle cx="229" cy="127" r="2" style={{ fill: secondary }} />

      <text x="235" y="148" textAnchor="start" style={{ fill: text, fontSize: 10 }}>
        Squeezed between surfaces
      </text>
      <circle cx="229" cy="145" r="2" style={{ fill: secondary }} />

      <text x="235" y="170" textAnchor="start" style={{ fill: secondary, fontSize: 9, fontStyle: 'italic' }}>
        e.g., copper, rubber, cork
      </text>
      <text x="235" y="182" textAnchor="start" style={{ fill: secondary, fontSize: 9, fontStyle: 'italic' }}>
        at flanges and joints
      </text>

      {/* VS divider */}
      <text x="210" y="120" textAnchor="middle" style={{ fill: secondary, fontSize: 12, fontWeight: 'bold' }}>
        vs
      </text>

      {/* Bottom note */}
      <text x="210" y="206" textAnchor="middle" style={{ fill: secondary, fontSize: 9 }}>
        Both prevent fluid leakage in hydraulic systems
      </text>
    </svg>
  )
}
