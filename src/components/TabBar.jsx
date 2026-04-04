import './TabBar.css';

const TABS = [
  { id: 'home', label: 'Home', icon: '\u2302' },
  { id: 'search', label: 'Search', icon: '\u2315' },
  { id: 'bookmarks', label: 'Bookmarks', icon: '\u2605' },
  { id: 'progress', label: 'Progress', icon: '\u25A4' },
];

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab-bar-item ${activeTab === tab.id ? 'tab-bar-item--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-bar-item__icon">{tab.icon}</span>
          <span className="tab-bar-item__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
