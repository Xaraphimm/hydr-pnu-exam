export default function OpenCenter() {
  const line = 'var(--color-diagram-line)'
  const text = 'var(--color-diagram-text)'
  const secondary = 'var(--color-diagram-secondary)'
  const accent = 'var(--color-accent)'

  return (
    <svg viewBox="0 0 420 200" style={{
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
        Open Center System (Series)
      </text>

      {/* PUMP box */}
      <rect x="10" y="50" width="60" height="35" rx="4"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="40" y="72" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        PUMP
      </text>

      {/* Arrow pump to valve1 */}
      <line x1="70" y1="67" x2="100" y2="67"
        style={{ stroke: accent, strokeWidth: 2 }} />
      <polygon points="96,62 106,67 96,72" style={{ fill: accent }} />

      {/* VALVE 1 */}
      <rect x="106" y="50" width="60" height="35" rx="4"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="136" y="72" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        VALVE 1
      </text>

      {/* Arrow valve1 to valve2 */}
      <line x1="166" y1="67" x2="196" y2="67"
        style={{ stroke: accent, strokeWidth: 2 }} />
      <polygon points="192,62 202,67 192,72" style={{ fill: accent }} />

      {/* VALVE 2 */}
      <rect x="202" y="50" width="60" height="35" rx="4"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="232" y="72" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        VALVE 2
      </text>

      {/* Arrow valve2 to valve3 */}
      <line x1="262" y1="67" x2="292" y2="67"
        style={{ stroke: accent, strokeWidth: 2 }} />
      <polygon points="288,62 298,67 288,72" style={{ fill: accent }} />

      {/* VALVE 3 */}
      <rect x="298" y="50" width="60" height="35" rx="4"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="328" y="72" textAnchor="middle" style={{ fill: text, fontSize: 10, fontWeight: 'bold' }}>
        VALVE 3
      </text>

      {/* Arrow valve3 to reservoir */}
      <line x1="358" y1="67" x2="375" y2="67"
        style={{ stroke: secondary, strokeWidth: 2 }} />
      <line x1="375" y1="67" x2="375" y2="110"
        style={{ stroke: secondary, strokeWidth: 2 }} />

      {/* RESERVOIR */}
      <rect x="345" y="110" width="60" height="35" rx="4"
        style={{ fill: 'none', stroke: line, strokeWidth: 2 }} />
      <text x="375" y="125" textAnchor="middle" style={{ fill: text, fontSize: 9, fontWeight: 'bold' }}>
        RESERVOIR
      </text>
      <text x="375" y="136" textAnchor="middle" style={{ fill: secondary, fontSize: 8 }}>
        (TANK)
      </text>

      {/* Series flow indicator line under valves */}
      <line x1="40" y1="95" x2="328" y2="95"
        style={{ stroke: secondary, strokeWidth: 1, strokeDasharray: '4,3' }} />
      <text x="184" y="108" textAnchor="middle" style={{ fill: secondary, fontSize: 9, fontStyle: 'italic' }}>
        Flow passes through each valve IN SERIES
      </text>

      {/* Notes */}
      <text x="210" y="155" textAnchor="middle" style={{ fill: text, fontSize: 11 }}>
        Flow is continuous through all valves when idle
      </text>
      <text x="210" y="172" textAnchor="middle" style={{ fill: accent, fontSize: 11, fontWeight: 'bold' }}>
        No pressure when idle
      </text>
      <text x="210" y="190" textAnchor="middle" style={{ fill: secondary, fontSize: 9 }}>
        Downstream valves lose flow when upstream valve is actuated
      </text>
    </svg>
  )
}
