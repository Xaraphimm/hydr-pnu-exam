import { useMemo, useState } from 'react';
import { CATEGORIES, TOPICS, getQuestionCount, hasQuestionData } from '../data/index.js';
import './CustomExamScreen.css';

export default function CustomExamScreen({ onBack, onStart }) {
  const [categoryId, setCategoryId] = useState('airframe');
  const [selectedTopics, setSelectedTopics] = useState(() =>
    CATEGORIES.airframe.topics.filter((topicId) => hasQuestionData(topicId)),
  );
  const [count, setCount] = useState(25);
  const [timed, setTimed] = useState(false);

  const availableTopics = useMemo(
    () => CATEGORIES[categoryId].topics.filter((topicId) => hasQuestionData(topicId)),
    [categoryId],
  );

  const totalAvailable = selectedTopics.reduce(
    (sum, topicId) => sum + getQuestionCount(topicId),
    0,
  );

  const changeCategory = (nextCategoryId) => {
    const nextTopics = CATEGORIES[nextCategoryId].topics.filter((topicId) => hasQuestionData(topicId));
    setCategoryId(nextCategoryId);
    setSelectedTopics(nextTopics);
    setCount(Math.min(25, Math.max(1, nextTopics.reduce((sum, topicId) => sum + getQuestionCount(topicId), 0))));
  };

  const toggleTopic = (topicId) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicId)) return prev.filter((id) => id !== topicId);
      return [...prev, topicId];
    });
  };

  const start = () => {
    onStart({
      categoryId,
      topicIds: selectedTopics,
      count: Math.min(Number(count) || 1, totalAvailable),
      timed,
      seed: Date.now(),
    });
  };

  return (
    <div className="custom-exam">
      <div className="custom-exam__header">
        <button className="custom-exam__back" onClick={onBack}>&larr;</button>
        <div>
          <h1 className="custom-exam__title">Custom Test Builder</h1>
          <p className="custom-exam__subtitle">
            Choose subjects, question count, and whether to simulate a timed exam.
          </p>
        </div>
      </div>

      <div className="custom-exam__card">
        <label className="custom-exam__label">Certificate area</label>
        <div className="custom-exam__tabs">
          {Object.entries(CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              className={`custom-exam__tab ${categoryId === key ? 'custom-exam__tab--active' : ''}`}
              onClick={() => changeCategory(key)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-exam__card">
        <label className="custom-exam__label">Topics</label>
        {availableTopics.map((topicId) => (
          <label key={topicId} className="custom-exam__topic">
            <input
              type="checkbox"
              checked={selectedTopics.includes(topicId)}
              onChange={() => toggleTopic(topicId)}
            />
            <span>{TOPICS[topicId].name}</span>
            <em>{getQuestionCount(topicId)} questions</em>
          </label>
        ))}
      </div>

      <div className="custom-exam__card custom-exam__settings">
        <label className="custom-exam__label" htmlFor="custom-count">Question count</label>
        <input
          id="custom-count"
          className="custom-exam__count"
          type="number"
          min="1"
          max={Math.max(1, totalAvailable)}
          value={count}
          onChange={(event) => setCount(event.target.value)}
        />
        <p className="custom-exam__hint">{totalAvailable} questions available from selected topics.</p>

        <label className="custom-exam__switch">
          <input type="checkbox" checked={timed} onChange={() => setTimed((value) => !value)} />
          <span>Timed exam mode (no feedback until the end)</span>
        </label>
      </div>

      <button className="custom-exam__start" disabled={selectedTopics.length === 0 || totalAvailable === 0} onClick={start}>
        Start Custom Test
      </button>
    </div>
  );
}
