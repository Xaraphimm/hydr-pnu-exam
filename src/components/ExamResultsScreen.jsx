// src/components/ExamResultsScreen.jsx
import { useState, useEffect, useRef } from 'react';
import { TOPICS } from '../data/index.js';
import { useHistory } from '../HistoryContext.jsx';
import { summarizeMissedAcsAreas } from '../utils/acs-analysis.js';
import './ExamResultsScreen.css';

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
  readOnly = false,
  onRetake,
  onStudyMissed,
  onRetakeMissed,
  onStartAcsReview,
  onHome,
}) {
  const { saveAttempt, recordAnswer } = useHistory();
  const savedRef = useRef(false);
  const [expandedQ, setExpandedQ] = useState(null);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all');

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

  // Compute per-topic breakdown
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
    if (readOnly || savedRef.current) return;
    savedRef.current = true;
    saveAttempt({
      topicId: topicId === 'airframe' ? 'airframe' : topicId,
      mode,
      version,
      seed,
      context,
      questions,
      answers,
      flagged,
      startTime,
      endTime,
    });
    if (mode === 'test') {
      questions.forEach((q) => {
        recordAnswer(q.id, answers[q.id] === q.c);
      });
    }
  }, [readOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const missed = questions.filter((q) => answers[q.id] !== q.c);
  const missedAcsGroups = summarizeMissedAcsAreas(questions, answers);
  const reviewQuestions = reviewFilter === 'incorrect' ? missed : questions;
  const isAcsMode = mode === 'acs' || context?.type === 'acs';
  const isCustomMode = context?.type === 'custom';
  const versionLabel = isAcsMode
    ? `ACS: ${context?.codes?.join(', ') || 'Targeted'}`
    : isCustomMode ? 'Custom Test'
    : version === 'random' ? 'Random' : `Version ${version}`;
  const modeLabel = isAcsMode ? 'Targeted Practice' : mode === 'study' ? 'Study' : 'Test';

  const getBarColor = (correct, total) => {
    const p = (correct / total) * 100;
    if (p >= 80) return 'var(--color-mastered, #4CAF50)';
    if (p >= 60) return 'var(--color-accent, #E8651A)';
    return 'var(--color-struggling, #ff4444)';
  };

  return (
    <div className="exam-results">
      <div className="exam-results__meta">{versionLabel} &middot; {modeLabel}</div>
      {isAcsMode && context && (
        <div className="exam-results__context">
          {context.totalMatches} matching question{context.totalMatches === 1 ? '' : 's'}
          {context.isCapped ? ' found; session capped to exam length.' : ' found; all matches were included.'}
        </div>
      )}
      {isCustomMode && context && (
        <div className="exam-results__context">
          {context.count} requested from {context.topicIds.length} topic{context.topicIds.length === 1 ? '' : 's'}
          {context.timed ? '; timed exam mode.' : '; study mode.'}
        </div>
      )}

      <div className={`exam-results__ring ${passed ? 'exam-results__ring--pass' : 'exam-results__ring--fail'}`}>
        <span className="exam-results__pct">{pct}%</span>
        <span className="exam-results__verdict">{passed ? 'PASS' : 'FAIL'}</span>
      </div>

      <div className="exam-results__detail">
        {score} of {questions.length} correct &middot; {formatTime(elapsed)}
      </div>

      <div className="exam-results__stats">
        <div className="exam-results__stat exam-results__stat--correct">
          <span className="exam-results__stat-num">{score}</span>
          <span className="exam-results__stat-label">Correct</span>
        </div>
        <div className="exam-results__stat exam-results__stat--wrong">
          <span className="exam-results__stat-num">{questions.length - score}</span>
          <span className="exam-results__stat-label">Wrong</span>
        </div>
        <div className="exam-results__stat exam-results__stat--flagged">
          <span className="exam-results__stat-num">{flaggedCount}</span>
          <span className="exam-results__stat-label">Flagged</span>
        </div>
      </div>

      {topicEntries.length > 1 && (
        <div className="exam-results__breakdown">
          <h3 className="exam-results__section-title">Performance by Topic</h3>
          {visibleTopics.map(([tid, { correct, total }]) => (
            <div key={tid} className="exam-results__topic-row">
              <div className="exam-results__topic-info">
                <span className="exam-results__topic-name">{TOPICS[tid]?.name || tid}</span>
                <span className="exam-results__topic-score" style={{ color: getBarColor(correct, total) }}>
                  {correct}/{total}
                </span>
              </div>
              <div className="exam-results__topic-bar">
                <div
                  className="exam-results__topic-fill"
                  style={{ width: `${(correct / total) * 100}%`, background: getBarColor(correct, total) }}
                />
              </div>
            </div>
          ))}
          {hiddenCount > 0 && !showAllTopics && (
            <button className="exam-results__show-more" onClick={() => setShowAllTopics(true)}>
              + {hiddenCount} more topics
            </button>
          )}
        </div>
      )}

      {missedAcsGroups.length > 0 && (
        <div className="exam-results__acs-report">
          <h3 className="exam-results__section-title">Study These ACS Areas</h3>
          <p className="exam-results__acs-hint">
            Use these missed ACS sections like an AKTR study list.
          </p>
          {missedAcsGroups.slice(0, 6).map((group) => (
            <div key={group.subject} className="exam-results__acs-row">
              <div className="exam-results__acs-main">
                <span className="exam-results__acs-code">{group.subject}</span>
                <span className="exam-results__acs-title">
                  {group.areaTitle} &gt; {group.subjectTitle}
                  {group.topicId ? ` (${group.topicId})` : ''}
                </span>
              </div>
              <div className="exam-results__acs-side">
                <span className="exam-results__acs-count">
                  {group.missedCount} missed
                </span>
                {onStartAcsReview && (
                  <button
                    className="exam-results__acs-practice"
                    onClick={() => onStartAcsReview(group.subject)}
                  >
                    Practice
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="exam-results__actions">
        {missed.length > 0 && (
          <button className="exam-results__action exam-results__action--primary" onClick={() => onStudyMissed(missed)}>
            Study Missed as Flashcards
          </button>
        )}
        {missed.length > 0 && onRetakeMissed && (
          <button className="exam-results__action exam-results__action--primary" onClick={() => onRetakeMissed(missed)}>
            Retake Missed Questions
          </button>
        )}
        <button className="exam-results__action exam-results__action--secondary" onClick={onRetake}>
          Retake Exam
        </button>
      </div>

      <div className="exam-results__review">
        <div className="exam-results__review-head">
          <h3 className="exam-results__section-title">Question Review</h3>
          {missed.length > 0 && (
            <button
              className="exam-results__review-toggle"
              onClick={() => {
                setExpandedQ(null);
                setReviewFilter((value) => value === 'all' ? 'incorrect' : 'all');
              }}
            >
              {reviewFilter === 'all' ? 'Incorrect Only' : 'Show All'}
            </button>
          )}
        </div>
        <p className="exam-results__review-hint">Tap to expand explanation</p>
        {reviewQuestions.map((q, i) => {
          const originalIndex = questions.findIndex((question) => question.id === q.id);
          const isCorrect = answers[q.id] === q.c;
          const isExpanded = expandedQ === i;
          return (
            <div key={q.id} className={`exam-results__q-row ${isExpanded ? 'exam-results__q-row--expanded' : ''}`} onClick={() => setExpandedQ(isExpanded ? null : i)}>
              <div className="exam-results__q-summary">
                <span className={`exam-results__q-icon ${isCorrect ? 'exam-results__q-icon--correct' : 'exam-results__q-icon--wrong'}`}>
                  {isCorrect ? '\u2713' : '\u2717'}
                </span>
                <span className={`exam-results__q-text ${!isCorrect ? 'exam-results__q-text--wrong' : ''}`}>
                  {q.q.length > 80 ? q.q.slice(0, 80) + '...' : q.q}
                </span>
                <span className="exam-results__q-num">Q{originalIndex + 1}</span>
              </div>
              {isExpanded && (
                <div className="exam-results__q-detail">
                  <div className={isCorrect ? 'exam-results__q-yours--correct' : 'exam-results__q-yours--wrong'}>
                    Your answer: {String.fromCharCode(65 + (answers[q.id] ?? -1))} &mdash; {q.a[answers[q.id]] ?? 'Skipped'}
                  </div>
                  {!isCorrect && (
                    <div className="exam-results__q-correct">
                      Correct: {String.fromCharCode(65 + q.c)} &mdash; {q.a[q.c]}
                    </div>
                  )}
                  <div className="exam-results__q-exp">{q.exp}</div>
                  {q.ref && <div className="exam-results__q-ref">Ref: {q.acs ? `${q.acs} — ` : ''}{q.ref}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="exam-results__home" onClick={onHome}>Home</button>
    </div>
  );
}
