import { describe, it, expect } from 'vitest';
import { shuffle } from '../../src/utils/shuffle.js';

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle([...input]);
    expect(result).toHaveLength(5);
  });

  it('contains all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle([...input]);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not modify the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(copy);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns empty array for empty input', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('returns single-element array unchanged', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});
