import { useEffect, useMemo, useState } from 'react';
import { useHistory } from '../HistoryContext.jsx';
import { TOPICS, loadAllQuestions } from '../data/index.js';
import './BookmarksScreen.css';

export default function BookmarksScreen({ onOpenQuestion }) {
  const { bookmarks, toggleQuestionBookmark, togglePdfBookmark } = useHistory();
  const [questionsByTopic, setQuestionsByTopic] = useState({});
  const hasAny = bookmarks.questions.length > 0 || bookmarks.pdfPages.length > 0;

  useEffect(() => {
    let active = true;
    loadAllQuestions().then((loaded) => {
      if (active) setQuestionsByTopic(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  const bookmarkedQuestions = useMemo(() => {
    const items = [];
    for (const [topicId, questions] of Object.entries(questionsByTopic)) {
      for (const question of questions) {
        if (bookmarks.questions.includes(question.id)) {
          items.push({ topicId, question });
        }
      }
    }
    return items;
  }, [bookmarks.questions, questionsByTopic]);

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
          {bookmarks.questions.map((qId) => {
            const item = bookmarkedQuestions.find((entry) => entry.question.id === qId);
            return (
              <div key={qId} className="bookmarks-screen__item">
                <button
                  className="bookmarks-screen__open"
                  onClick={() => item && onOpenQuestion?.(item.topicId, item.question)}
                  disabled={!item}
                >
                  <span className="bookmarks-screen__qid">{qId}</span>
                  <span>{item?.question.q ?? 'Question not loaded yet'}</span>
                </button>
                <button className="bookmarks-screen__remove" onClick={() => toggleQuestionBookmark(qId)}>
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
      {bookmarks.pdfPages.length > 0 && (
        <div className="bookmarks-screen__section">
          <h3 className="bookmarks-screen__section-title">PDF Pages ({bookmarks.pdfPages.length})</h3>
          {bookmarks.pdfPages.map((p, i) => (
            <div key={`${p.topicId}-${p.page}-${i}`} className="bookmarks-screen__item">
              <span>{TOPICS[p.topicId]?.name || p.topicId}</span>
              <span className="bookmarks-screen__page">Page {p.page}</span>
              <button className="bookmarks-screen__remove" onClick={() => togglePdfBookmark(p.topicId, p.page)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
