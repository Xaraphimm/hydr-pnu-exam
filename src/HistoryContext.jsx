import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { updateConfidence as calcConfidence } from './utils/mastery.js';
import { migrateLocalStorage } from './utils/migration.js';

const HistoryContext = createContext();

const CONFIDENCE_KEY = 'phnx-confidence';
const ATTEMPTS_KEY = 'phnx-attempts';
const BOOKMARKS_KEY = 'phnx-bookmarks';
const NOTES_KEY = 'phnx-notes';

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function HistoryProvider({ children }) {
  useEffect(() => {
    migrateLocalStorage();
  }, []);

  const [confidence, setConfidence] = useState(() => loadJSON(CONFIDENCE_KEY, {}));
  const [attempts, setAttempts] = useState(() => loadJSON(ATTEMPTS_KEY, []));
  const [bookmarks, setBookmarks] = useState(() =>
    loadJSON(BOOKMARKS_KEY, { questions: [], pdfPages: [] })
  );
  const [notes, setNotes] = useState(() => loadJSON(NOTES_KEY, {}));

  const recordAnswer = useCallback(
    (questionId, correct) => {
      setConfidence((prev) => {
        const next = {
          ...prev,
          [questionId]: calcConfidence(prev[questionId] || null, correct),
        };
        localStorage.setItem(CONFIDENCE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const saveAttempt = useCallback(
    ({ topicId, mode, questions: qs, answers, startTime, endTime }) => {
      const score = qs.reduce(
        (acc, q) => acc + (answers[q.id] === q.c ? 1 : 0),
        0
      );
      const missed = qs
        .filter((q) => answers[q.id] !== q.c)
        .map((q) => q.id);

      const attempt = {
        id: crypto.randomUUID(),
        topicId,
        mode,
        score,
        total: qs.length,
        time: Math.round((endTime - startTime) / 1000),
        missed,
        date: Date.now(),
      };

      setAttempts((prev) => {
        const next = [attempt, ...prev];
        localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(next));
        return next;
      });

      return attempt;
    },
    []
  );

  const toggleQuestionBookmark = useCallback(
    (questionId) => {
      setBookmarks((prev) => {
        const qs = prev.questions.includes(questionId)
          ? prev.questions.filter((id) => id !== questionId)
          : [...prev.questions, questionId];
        const next = { ...prev, questions: qs };
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const togglePdfBookmark = useCallback(
    (topicId, page) => {
      setBookmarks((prev) => {
        const exists = prev.pdfPages.some(
          (p) => p.topicId === topicId && p.page === page
        );
        const pages = exists
          ? prev.pdfPages.filter(
              (p) => !(p.topicId === topicId && p.page === page)
            )
          : [...prev.pdfPages, { topicId, page }];
        const next = { ...prev, pdfPages: pages };
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const isQuestionBookmarked = useCallback(
    (questionId) => bookmarks.questions.includes(questionId),
    [bookmarks.questions]
  );

  const getNote = useCallback(
    (topicId) => notes[topicId] || '',
    [notes]
  );

  const saveNote = useCallback(
    (topicId, text) => {
      setNotes((prev) => {
        const next = { ...prev, [topicId]: text };
        localStorage.setItem(NOTES_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const getTopicAttempts = useCallback(
    (topicId) => attempts.filter((a) => a.topicId === topicId),
    [attempts]
  );

  const clearHistory = useCallback(() => {
    setConfidence({});
    setAttempts([]);
    setBookmarks({ questions: [], pdfPages: [] });
    setNotes({});
    localStorage.removeItem(CONFIDENCE_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(BOOKMARKS_KEY);
    localStorage.removeItem(NOTES_KEY);
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        confidence,
        attempts,
        bookmarks,
        recordAnswer,
        saveAttempt,
        toggleQuestionBookmark,
        togglePdfBookmark,
        isQuestionBookmarked,
        getNote,
        saveNote,
        getTopicAttempts,
        clearHistory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
