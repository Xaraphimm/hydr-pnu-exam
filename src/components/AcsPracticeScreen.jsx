import { useMemo, useState } from 'react';
import { getMatchingAcsQuestions, parseAcsCodes } from '../utils/acs-filter.js';
import './AcsPracticeScreen.css';

export default function AcsPracticeScreen({
  questionsByTopic,
  maxQuestions,
  isLoading,
  onBack,
  onStart,
}) {
  const [input, setInput] = useState('');

  const codes = useMemo(() => parseAcsCodes(input), [input]);
  const matches = useMemo(
    () => getMatchingAcsQuestions(questionsByTopic, codes),
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
            Build an Airframe practice session from the ACS codes you want to brush up on.
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
          placeholder="AM.II.F.K1, AM.II.F"
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
              ? `This session will be capped to the ${maxQuestions}-question Airframe exam amount.`
              : `Fewer than ${maxQuestions} matches were found, so this session will use all matching questions.`}
          </p>
        )}
      </div>

      {hasCodes && !isLoading && matchCount === 0 && (
        <div className="acs-practice__empty">
          No questions match those ACS codes. Try a full code like <strong>AM.II.F.K1</strong> or a prefix like <strong>AM.II.F</strong>.
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
