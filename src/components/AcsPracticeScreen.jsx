import { useMemo, useState } from 'react';
import {
  getMatchingAcsQuestions,
  parseAcsCodes,
  summarizeAcsEntries,
} from '../utils/acs-filter.js';
import './AcsPracticeScreen.css';

function sectionLabel(section) {
  if (!section) return null;
  const parts = [];
  if (section.areaTitle) parts.push(section.areaTitle);
  if (section.subjectTitle) parts.push(section.subjectTitle);
  return parts.join(' > ');
}

export default function AcsPracticeScreen({
  questionsByTopic,
  maxQuestions,
  isLoading,
  onBack,
  onStart,
  categoryName = 'Airframe',
  exampleCode = 'AM.II.F.K1',
  examplePrefix = 'AM.II.F',
}) {
  const [input, setInput] = useState('');

  const codes = useMemo(() => parseAcsCodes(input), [input]);
  const matches = useMemo(
    () => getMatchingAcsQuestions(questionsByTopic, codes),
    [questionsByTopic, codes],
  );
  const entries = useMemo(
    () => summarizeAcsEntries(questionsByTopic, codes),
    [questionsByTopic, codes],
  );

  const hasCodes = codes.length > 0;
  const matchCount = matches.length;
  const sessionCount = Math.min(matchCount, maxQuestions);
  const isCapped = matchCount > maxQuestions;
  const canStart = hasCodes && matchCount > 0 && !isLoading;

  return (
    <div className="acs-practice">
      <div className="acs-practice__header">
        <button className="acs-practice__back" onClick={onBack}>&larr;</button>
        <div>
          <h1 className="acs-practice__title">ACS Targeted Practice</h1>
          <p className="acs-practice__subtitle">
            Build a {categoryName} practice session from the ACS codes you want to brush up on.
          </p>
        </div>
      </div>

      <div className="acs-practice__card">
        <label className="acs-practice__label" htmlFor="acs-codes">
          Enter ACS codes or prefixes
        </label>
        <textarea
          id="acs-codes"
          className="acs-practice__input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={`${exampleCode}, ${examplePrefix}`}
          rows={5}
        />
        <p className="acs-practice__hint">
          Separate multiple entries with commas, spaces, semicolons, or new lines.
        </p>
      </div>

      <div className="acs-practice__summary">
        <div className="acs-practice__summary-row">
          <span>Entered codes</span>
          <strong>{hasCodes ? codes.join(', ') : 'None yet'}</strong>
        </div>
        <div className="acs-practice__summary-row">
          <span>Matching questions</span>
          <strong>{isLoading ? 'Loading...' : matchCount}</strong>
        </div>
        <div className="acs-practice__summary-row">
          <span>Session size</span>
          <strong>
            {isLoading || !hasCodes ? '-' : `${sessionCount} question${sessionCount === 1 ? '' : 's'}`}
          </strong>
        </div>
        {hasCodes && matchCount > 0 && (
          <p className="acs-practice__cap-note">
            {isCapped
              ? `This session will be capped to the ${maxQuestions}-question ${categoryName} exam amount.`
              : `Fewer than ${maxQuestions} matches were found, so this session will use all matching questions.`}
          </p>
        )}
      </div>

      {hasCodes && (
        <div className="acs-practice__sections">
          <h2 className="acs-practice__sections-title">Section mapping</h2>
          <ul className="acs-practice__sections-list">
            {entries.map((entry) => {
              const label = sectionLabel(entry.section);
              let statusClass = 'acs-practice__section--ok';
              let statusText;

              if (!entry.recognized) {
                statusClass = 'acs-practice__section--unknown';
                statusText = 'Not a valid ACS code';
              } else if (isLoading) {
                statusText = 'Checking questions...';
              } else if (entry.matchCount > 0) {
                statusText = `${entry.matchCount} question${entry.matchCount === 1 ? '' : 's'}`;
              } else {
                statusClass = 'acs-practice__section--empty';
                statusText = 'No questions yet';
              }

              return (
                <li key={entry.code} className={`acs-practice__section ${statusClass}`}>
                  <div className="acs-practice__section-main">
                    <span className="acs-practice__section-code">{entry.code}</span>
                    <span className="acs-practice__section-status">{statusText}</span>
                  </div>
                  {entry.recognized && (
                    <div className="acs-practice__section-meta">
                      <span className="acs-practice__section-path">
                        {label}
                        {entry.section.topicId ? ` (${entry.section.topicId})` : ''}
                      </span>
                      {entry.section.element?.text && (
                        <span className="acs-practice__section-text">{entry.section.element.text}</span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {hasCodes && !isLoading && matchCount === 0 && (
        <div className="acs-practice__empty">
          None of those ACS codes have questions yet. Enter a code from a section
          that has questions, like <strong>{exampleCode}</strong>, or a prefix like <strong>{examplePrefix}</strong>.
        </div>
      )}

      <button
        className="acs-practice__start"
        onClick={() => onStart({ input })}
        disabled={!canStart}
      >
        Start ACS Targeted Practice
      </button>
    </div>
  );
}
