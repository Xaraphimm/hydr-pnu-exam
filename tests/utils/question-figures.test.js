import { describe, expect, it } from 'vitest';
import { getFigureCategory, getQuestionFigure } from '../../src/utils/question-figures.js';

describe('getQuestionFigure', () => {
  it('detects a figure reference from the question stem', () => {
    const figure = getQuestionFigure({
      q: '(Refer to Figure 12.) What is shown?',
      diagram: null,
    });

    expect(figure).toEqual({
      label: 'Figure 12',
      src: '/figures/airframe/figure-12.png',
    });
  });

  it('detects a figure reference from legacy diagram strings', () => {
    const figure = getQuestionFigure({
      q: 'Select the proper rivet.',
      diagram: 'Refer to Figure 1',
    });

    expect(figure).toEqual({
      label: 'Figure 1',
      src: '/figures/airframe/figure-1.png',
    });
  });

  it('supports explicit figure objects', () => {
    const figure = getQuestionFigure({
      q: 'Use the exhibit.',
      figure: { label: 'Figure A', src: '/figures/custom/a.png' },
    });

    expect(figure).toEqual({ label: 'Figure A', src: '/figures/custom/a.png' });
  });

  it('returns null when no figure is referenced', () => {
    expect(getQuestionFigure({ q: 'No figure here.', diagram: null })).toBeNull();
  });

  it('detects figure category from ACS code', () => {
    expect(getFigureCategory({ acs: 'AM.III.G.K1' })).toBe('powerplant');
    expect(getFigureCategory({ acs: 'AM.II.E.K1' })).toBe('airframe');
  });
});
