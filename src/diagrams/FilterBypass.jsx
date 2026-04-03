export default function FilterBypass() {
  const line = 'var(--color-diagram-line)'
  const text = 'var(--color-diagram-text)'
  const secondary = 'var(--color-diagram-secondary)'
  const accent = 'var(--color-accent)'

  return (
    <svg viewBox="0 0 400 200" style={{
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
        Filter with Bypass Valve
      </text>

      {/* Housing outline */}
      <rect x="100" y="55" width="200" height="80" rx="8"
        style={{ fill: 'none', stroke: line, strokeWidth: 2.5 }} />

      {/* Filter element inside housing */}
      <rect x="150" y="68" width="100" height="54" rx="4"
        style={{ fill: 'none', stroke: secondary, strokeWidth: 1.5, strokeDasharray: '4,2' }} />
      <text x="200" y="92" textAnchor="middle" style={{ fill: secondary, fontSize: 10 }}>
        FILTER
      </text>
      <text x="200" y="104" textAnchor="middle" style={{ fill: secondary, fontSize: 10 }}>
        ELEMENT
      </text>
      {/* Filter lines (hatching) */}
      <line x1="165" y1="73" x2="165" y2="117" style={{ stroke: secondary, strokeWidth: 0.5, opacity: 0.4 }} />
      <line x1="180" y1="73" x2="180" y2="117" style={{ stroke: secondary, strokeWidth: 0.5, opacity: 0.4 }} />
      <line x1="220" y1="73" x2="220" y2="117" style={{ stroke: secondary, strokeWidth: 0.5, opacity: 0.4 }} />
      <line x1="235" y1="73" x2="235" y2="117" style={{ stroke: secondary, strokeWidth: 0.5, opacity: 0.4 }} />

      {/* IN arrow */}
      <line x1="30" y1="95" x2="98" y2="95"
        style={{ stroke: accent, strokeWidth: 2.5 }} />
      <polygon points="94,89 104,95 94,101" style={{ fill: accent }} />
      <text x="55" y="87" textAnchor="middle" style={{ fill: accent, fontSize: 11, fontWeight: 'bold' }}>
        IN
      </text>

      {/* OUT arrow */}
      <line x1="302" y1="95" x2="370" y2="95"
        style={{ stroke: line, strokeWidth: 2.5 }} />
      <polygon points="366,89 376,95 366,101" style={{ fill: line }} />
      <text x="345" y="87" textAnchor="middle" style={{ fill: text, fontSize: 11, fontWeight: 'bold' }}>
        OUT
      </text>

      {/* Flow arrow through filter */}
      <polygon points="255,92 265,95 255,98" style={{ fill: secondary, opacity: 0.6 }} />

      {/* Bypass path arching over the top */}
      <path d="M 100,70 C 100,30 300,30 300,70"
        style={{ fill: 'none', stroke: accent, strokeWidth: 2, strokeDasharray: '6,4' }} />
      {/* Bypass arrow */}
      <polygon points="296,58 304,68 290,68" style={{ fill: accent }} />

      {/* Bypass label */}
      <text x="200" y="42" textAnchor="middle" style={{ fill: accent, fontSize: 10, fontWeight: 'bold' }}>
        BYPASS - opens if clogged
      </text>

      {/* Note */}
      <text x="200" y="160" textAnchor="middle" style={{ fill: text, fontSize: 11 }}>
        Bypass valve opens when filter is clogged
      </text>
      <text x="200" y="178" textAnchor="middle" style={{ fill: accent, fontSize: 11, fontWeight: 'bold' }}>
        Dirty fluid preferred over no flow
      </text>
    </svg>
  )
}
