import { describe, it, expect, beforeEach } from 'vitest';
import { migrateLocalStorage } from '../../src/utils/migration.js';

beforeEach(() => {
  localStorage.clear();
});

describe('migrateLocalStorage', () => {
  it('does nothing when no old data exists', () => {
    migrateLocalStorage();
    expect(localStorage.getItem('phnx-confidence')).toBeNull();
    expect(localStorage.getItem('phnx-attempts')).toBeNull();
  });

  it('migrates hydr-pnu-qstats to phnx-confidence', () => {
    localStorage.setItem('hydr-pnu-qstats', JSON.stringify({
      1: { timesAnswered: 10, timesCorrect: 8 },
      2: { timesAnswered: 5, timesCorrect: 1 },
      3: { timesAnswered: 0, timesCorrect: 0 },
    }));

    migrateLocalStorage();

    const confidence = JSON.parse(localStorage.getItem('phnx-confidence'));
    expect(confidence['AF06-1'].level).toBe(4);
    expect(confidence['AF06-1'].attempts).toBe(10);
    expect(confidence['AF06-2'].level).toBe(1);
    expect(confidence['AF06-2'].attempts).toBe(5);
    expect(confidence['AF06-3']).toBeUndefined();
  });

  it('migrates hydr-pnu-attempts to phnx-attempts', () => {
    localStorage.setItem('hydr-pnu-attempts', JSON.stringify([
      { id: 'abc', date: 1000, mode: 'exam', score: 100, total: 145, elapsed: 3600, missedQuestionIds: [5, 10] },
    ]));

    migrateLocalStorage();

    const attempts = JSON.parse(localStorage.getItem('phnx-attempts'));
    expect(attempts).toHaveLength(1);
    expect(attempts[0].topicId).toBe('AF-06');
    expect(attempts[0].score).toBe(100);
    expect(attempts[0].missed).toEqual(['AF06-5', 'AF06-10']);
  });

  it('removes old keys after migration', () => {
    localStorage.setItem('hydr-pnu-qstats', '{}');
    localStorage.setItem('hydr-pnu-attempts', '[]');

    migrateLocalStorage();

    expect(localStorage.getItem('hydr-pnu-qstats')).toBeNull();
    expect(localStorage.getItem('hydr-pnu-attempts')).toBeNull();
  });

  it('does not re-migrate if new keys already exist', () => {
    localStorage.setItem('phnx-confidence', '{"existing": true}');
    localStorage.setItem('hydr-pnu-qstats', '{"1": {"timesAnswered": 5, "timesCorrect": 5}}');

    migrateLocalStorage();

    const confidence = JSON.parse(localStorage.getItem('phnx-confidence'));
    expect(confidence.existing).toBe(true);
    expect(confidence['AF06-1']).toBeUndefined();
  });
});
