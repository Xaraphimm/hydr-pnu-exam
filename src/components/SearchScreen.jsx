import { useState, useEffect, useMemo } from 'react';
import { loadAllQuestions } from '../data/index.js';
import { TOPICS } from '../data/index.js';
import './SearchScreen.css';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [allQuestions, setAllQuestions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllQuestions().then((data) => {
      setAllQuestions(data);
      setLoading(false);
    });
  }, []);

  const results = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return {};
    const lowerQuery = query.toLowerCase();
    const grouped = {};
    for (const [topicId, questions] of Object.entries(allQuestions)) {
      const matches = questions.filter((q) =>
        q.q.toLowerCase().includes(lowerQuery) ||
        q.a.some((a) => a.toLowerCase().includes(lowerQuery)) ||
        q.exp.toLowerCase().includes(lowerQuery)
      );
      if (matches.length > 0) {
        grouped[topicId] = matches;
      }
    }
    return grouped;
  }, [query, allQuestions]);

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="search-screen">
      <h2 className="search-screen__title">Search</h2>
      <input
        className="search-screen__input"
        type="text"
        placeholder="Search questions, answers, explanations..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      {loading && <p className="search-screen__status">Loading questions...</p>}
      {!loading && query.trim().length >= 2 && (
        <p className="search-screen__status">{totalResults} result{totalResults !== 1 ? 's' : ''}</p>
      )}
      {Object.entries(results).map(([topicId, questions]) => (
        <div key={topicId} className="search-screen__group">
          <h3 className="search-screen__group-title">{TOPICS[topicId]?.name || topicId}</h3>
          {questions.map((q) => (
            <div key={q.id} className="search-screen__result">
              <span className="search-screen__qid">{q.id}</span>
              <p className="search-screen__qtext">{q.q}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
