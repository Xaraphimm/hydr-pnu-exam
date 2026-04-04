import './TabBar.css'

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <nav className="tab-bar">
      <button
        className={`tab-bar-item ${activeTab === 'exam' ? 'tab-bar-item--active' : ''}`}
        onClick={() => onTabChange('exam')}
      >
        <svg className="tab-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
        <span className="tab-bar-label">Exam</span>
      </button>
      <button
        className={`tab-bar-item ${activeTab === 'flashcards' ? 'tab-bar-item--active' : ''}`}
        onClick={() => onTabChange('flashcards')}
      >
        <svg className="tab-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="14" rx="2" />
          <rect x="4" y="6" width="20" height="14" rx="2" fill="var(--color-bg)" />
          <path d="M8 13h8" />
          <path d="M8 17h5" />
        </svg>
        <span className="tab-bar-label">Flashcards</span>
      </button>
    </nav>
  )
}
