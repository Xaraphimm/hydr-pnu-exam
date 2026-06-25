import { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { TOPICS } from '../data/index.js';
import { useHistory } from '../HistoryContext.jsx';
import { Screen } from './Screen.jsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function perfColor(correct, total) {
  const p = (correct / total) * 100;
  if (p >= 80) return 'text-success';
  if (p >= 60) return 'text-primary';
  return 'text-destructive';
}

function perfBg(correct, total) {
  const p = (correct / total) * 100;
  if (p >= 80) return 'bg-success';
  if (p >= 60) return 'bg-primary';
  return 'bg-destructive';
}

export default function ExamResultsScreen({
  questions,
  answers,
  flagged,
  startTime,
  endTime,
  topicId,
  mode,
  version,
  seed,
  context,
  onRetake,
  onStudyMissed,
  onHome,
}) {
  const { saveAttempt, recordAnswer } = useHistory();
  const savedRef = useRef(false);
  const [expandedQ, setExpandedQ] = useState(null);
  const [showAllTopics, setShowAllTopics] = useState(false);

  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.c ? 1 : 0), 0);
  const pct = Math.round((score / questions.length) * 100);
  const passed = pct >= 70;
  const elapsed = Math.floor((endTime - startTime) / 1000);
  const flaggedCount = flagged ? flagged.size : 0;

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}h ${m}m` : `${m}m ${sec}s`;
  };

  const topicBreakdown = {};
  for (const q of questions) {
    const prefix = q.id.split('-')[0];
    const topicKey = prefix.replace(/([A-Z]+)(\d+)/, '$1-$2');
    if (!topicBreakdown[topicKey]) topicBreakdown[topicKey] = { correct: 0, total: 0 };
    topicBreakdown[topicKey].total++;
    if (answers[q.id] === q.c) topicBreakdown[topicKey].correct++;
  }

  const topicEntries = Object.entries(topicBreakdown)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total));

  const visibleTopics = showAllTopics ? topicEntries : topicEntries.slice(0, 5);
  const hiddenCount = topicEntries.length - 5;

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    saveAttempt({
      topicId: topicId === 'airframe' ? 'airframe' : topicId,
      mode,
      version,
      seed,
      context,
      questions,
      answers,
      startTime,
      endTime,
    });
    if (mode === 'test') {
      questions.forEach((q) => {
        recordAnswer(q.id, answers[q.id] === q.c);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const missed = questions.filter((q) => answers[q.id] !== q.c);
  const isAcsMode = mode === 'acs' || context?.type === 'acs';
  const versionLabel = isAcsMode
    ? `ACS: ${context?.codes?.join(', ') || 'Targeted'}`
    : version === 'random' ? 'Random' : `Version ${version}`;
  const modeLabel = isAcsMode ? 'Targeted Practice' : mode === 'study' ? 'Study' : 'Test';

  return (
    <Screen>
      <div className="flex flex-col items-center gap-1 text-center">
        <Badge variant="secondary">{versionLabel} &middot; {modeLabel}</Badge>
        {isAcsMode && context && (
          <p className="text-xs text-muted-foreground">
            {context.totalMatches} matching question{context.totalMatches === 1 ? '' : 's'}
            {context.isCapped ? ' found; session capped to exam length.' : ' found; all matches were included.'}
          </p>
        )}

        <div
          className={cn(
            'mt-3 flex size-28 flex-col items-center justify-center rounded-full border-4',
            passed ? 'border-success text-success' : 'border-destructive text-destructive',
          )}
        >
          <span className="text-3xl font-bold tabular-nums">{pct}%</span>
          <span className="text-xs font-semibold tracking-wider">{passed ? 'PASS' : 'FAIL'}</span>
        </div>

        <div className="mt-2 text-sm text-muted-foreground">
          {score} of {questions.length} correct &middot; {formatTime(elapsed)}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        {[
          ['Correct', score, 'text-success'],
          ['Wrong', questions.length - score, 'text-destructive'],
          ['Flagged', flaggedCount, 'text-primary'],
        ].map(([label, num, color]) => (
          <Card key={label} className="items-center gap-0.5 p-3">
            <span className={cn('text-2xl font-bold tabular-nums', color)}>{num}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </Card>
        ))}
      </div>

      {topicEntries.length > 1 && (
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground">PERFORMANCE BY TOPIC</h3>
          <div className="grid gap-3">
            {visibleTopics.map(([tid, { correct, total }]) => (
              <div key={tid} className="grid gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="min-w-0 truncate">{TOPICS[tid]?.name || tid}</span>
                  <span className={cn('shrink-0 font-medium tabular-nums', perfColor(correct, total))}>
                    {correct}/{total}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={cn('h-full rounded-full', perfBg(correct, total))} style={{ width: `${(correct / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          {hiddenCount > 0 && !showAllTopics && (
            <button onClick={() => setShowAllTopics(true)} className="mt-3 cursor-pointer text-sm font-medium text-primary hover:underline">
              + {hiddenCount} more topics
            </button>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-2.5">
        {missed.length > 0 && (
          <Button onClick={() => onStudyMissed(missed)}>Study Missed as Flashcards</Button>
        )}
        <Button variant="outline" onClick={onRetake}>Retake Exam</Button>
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground">QUESTION REVIEW</h3>
        <p className="mb-2 text-xs text-muted-foreground">Tap to expand explanation</p>
        <div className="grid gap-2">
          {questions.map((q, i) => {
            const isCorrect = answers[q.id] === q.c;
            const isExpanded = expandedQ === i;
            return (
              <div
                key={q.id}
                onClick={() => setExpandedQ(isExpanded ? null : i)}
                className="cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-accent/30"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full text-white',
                      isCorrect ? 'bg-success' : 'bg-destructive',
                    )}
                  >
                    {isCorrect ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                  </span>
                  <span className={cn('min-w-0 flex-1 truncate text-sm', !isCorrect && 'text-foreground')}>
                    {q.q.length > 80 ? q.q.slice(0, 80) + '...' : q.q}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">Q{i + 1}</span>
                </div>
                {isExpanded && (
                  <div className="mt-3 grid gap-1.5 border-t pt-3 text-sm">
                    <div className={isCorrect ? 'text-success' : 'text-destructive'}>
                      Your answer: {String.fromCharCode(65 + (answers[q.id] ?? -1))} &mdash; {q.a[answers[q.id]] ?? 'Skipped'}
                    </div>
                    {!isCorrect && (
                      <div className="text-success">
                        Correct: {String.fromCharCode(65 + q.c)} &mdash; {q.a[q.c]}
                      </div>
                    )}
                    <div className="text-muted-foreground">{q.exp}</div>
                    {q.ref && <div className="font-mono text-xs text-muted-foreground">Ref: {q.acs ? `${q.acs} — ` : ''}{q.ref}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Button variant="ghost" className="mt-5 w-full text-muted-foreground" onClick={onHome}>Home</Button>
    </Screen>
  );
}
