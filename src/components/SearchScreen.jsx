import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { loadAllQuestions } from '../data/index.js';
import { TOPICS } from '../data/index.js';
import { Screen } from './Screen.jsx';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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
    <Screen>
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Search</h1>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search questions, answers, explanations..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="h-11 pl-9"
        />
      </div>

      {loading && <p className="mt-4 text-sm text-muted-foreground">Loading questions...</p>}
      {!loading && query.trim().length >= 2 && (
        <p className="mt-4 text-sm text-muted-foreground">{totalResults} result{totalResults !== 1 ? 's' : ''}</p>
      )}

      {Object.entries(results).map(([topicId, questions]) => (
        <div key={topicId} className="mt-4">
          <h2 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground">
            {TOPICS[topicId]?.name || topicId}
          </h2>
          <div className="grid gap-2.5">
            {questions.map((q) => (
              <Card key={q.id} className="gap-1 p-3.5">
                <span className="font-mono text-xs text-muted-foreground">{q.id}</span>
                <p className="text-sm">{q.q}</p>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </Screen>
  );
}
