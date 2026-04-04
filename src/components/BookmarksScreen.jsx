import { useHistory } from '../HistoryContext.jsx';
import { TOPICS } from '../data/index.js';
import './BookmarksScreen.css';

export default function BookmarksScreen() {
  const { bookmarks } = useHistory();
  const hasAny = bookmarks.questions.length > 0 || bookmarks.pdfPages.length > 0;

  return (
    <div className="bookmarks-screen">
      <h2 className="bookmarks-screen__title">Bookmarks</h2>
      {!hasAny && (
        <div className="bookmarks-screen__empty">
          <p>No bookmarks yet.</p>
          <p>Bookmark questions during tests/flashcards or pages while studying.</p>
        </div>
      )}
      {bookmarks.questions.length > 0 && (
        <div className="bookmarks-screen__section">
          <h3 className="bookmarks-screen__section-title">Questions ({bookmarks.questions.length})</h3>
          {bookmarks.questions.map((qId) => (
            <div key={qId} className="bookmarks-screen__item">
              <span className="bookmarks-screen__qid">{qId}</span>
            </div>
          ))}
        </div>
      )}
      {bookmarks.pdfPages.length > 0 && (
        <div className="bookmarks-screen__section">
          <h3 className="bookmarks-screen__section-title">PDF Pages ({bookmarks.pdfPages.length})</h3>
          {bookmarks.pdfPages.map((p, i) => (
            <div key={i} className="bookmarks-screen__item">
              <span>{TOPICS[p.topicId]?.name || p.topicId}</span>
              <span className="bookmarks-screen__page">Page {p.page}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
