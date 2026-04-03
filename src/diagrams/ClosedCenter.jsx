export default function ClosedCenter() {
  const line = 'var(--color-diagram-line)'
  const text = 'var(--color-diagram-text)'
  const secondary = 'var(--color-diagram-secondary)'
  const accent = 'var(--color-accent)'

  return (
    <svg viewBox="0 0 420 240" style={{
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
        Closed Center System (Parallel)
      </text>

      {/* PUMP box */}
      <rect x="10" y="75" width="60" height="35" rx="4"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="40" y="97" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        PUMP
      </text>

      {/* Pressure line from pump */}
      <line x1="70" y1="92" x2="130" y2="92"
        style={{ stroke: accent, strokeWidth: 2.5 }} />
      <text x="100" y="86" textAnchor="middle" style={{ fill: accent, fontSize: 8 }}>
        PRESSURE
      </text>

      {/* Vertical pressure manifold */}
      <line x1="130" y1="50" x2="130" y2="140"
        style={{ stroke: accent, strokeWidth: 2.5 }} />

      {/* Branch to VALVE 1 */}
      <line x1="130" y1="55" x2="200" y2="55"
        style={{ stroke: accent, strokeWidth: 2 }} />
      <polygon points="196,50 206,55 196,60" style={{ fill: accent }} />
      <rect x="206" y="40" width="70" height="30" rx="4"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="241" y="59" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        VALVE 1
      </text>

      {/* Branch to VALVE 2 */}
      <line x1="130" y1="92" x2="200" y2="92"
        style={{ stroke: accent, strokeWidth: 2 }} />
      <polygon points="196,87 206,92 196,97" style={{ fill: accent }} />
      <rect x="206" y="77" width="70" height="30" rx="4"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="241" y="96" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        VALVE 2
      </text>

      {/* Branch to VALVE 3 */}
      <line x1="130" y1="130" x2="200" y2="130"
        style={{ stroke: accent, strokeWidth: 2 }} />
      <polygon points="196,125 206,130 196,135" style={{ fill: accent }} />
      <rect x="206" y="115" width="70" height="30" rx="4"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="241" y="134" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        VALVE 3
      </text>

      {/* Return lines from each valve */}
      <line x1="276" y1="55" x2="340" y2="55"
        style={{ stroke: secondary, strokeWidth: 1.5 }} />
      <line x1="276" y1="92" x2="340" y2="92"
        style={{ stroke: secondary, strokeWidth: 1.5 }} />
      <line x1="276" y1="130" x2="340" y2="130"
        style={{ stroke: secondary, strokeWidth: 1.5 }} />

      {/* Vertical return manifold */}
      <line x1="340" y1="50" x2="340" y2="140"
        style={{ stroke: secondary, strokeWidth: 1.5 }} />
      <text x="355" y="86" textAnchor="start" style={{ fill: secondary, fontSize: 8 }}>
        RETURN
      </text>

      {/* Return to reservoir */}
      <line x1="340" y1="140" x2="340" y2="160"
        style={{ stroke: secondary, strokeWidth: 1.5 }} />
      <rect x="310" y="160" width="60" height="25" rx="4"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="340" y="177" textAnchor="middle" style={{ fill: text, fontSize: 9, fontWeight: 'bold' }}>
        RESERVOIR
      </text>

      {/* Notes */}
      <text x="210" y="205" textAnchor="middle" style={{ fill: secondary, fontSize: 10, fontStyle: 'italic' }}>
        Each valve fed independently IN PARALLEL
      </text>
      <text x="210" y="222" textAnchor="middle" style={{ fill: accent, fontSize: 11, fontWeight: 'bold' }}>
        Pressure available instantly
      </text>
    </svg>
  )
}
