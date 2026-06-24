import { describe, expect, it } from 'vitest';
import {
  getAcsCodeSections,
  getAcsSection,
} from '../../src/utils/acs-sections.js';

describe('getAcsSection', () => {
  it('maps a full ACS code to its Airframe topic section', () => {
    expect(getAcsSection('AM.II.F.K1')).toMatchObject({
      prefix: 'AM.II.F',
      topicId: 'AF-06',
      name: 'Hydraulic & Pneumatic Systems',
    });
  });

  it('normalizes case and accepts ACS prefixes', () => {
    expect(getAcsSection(' am.ii.c ')).toMatchObject({
      prefix: 'AM.II.C',
      topicId: 'AF-03',
      name: 'Flight Controls',
    });
  });

  it('returns null for unknown or malformed ACS sections', () => {
    expect(getAcsSection('AM.II.FA.K1')).toBeNull();
    expect(getAcsSection('AM.III.A.K1')).toBeNull();
    expect(getAcsSection('')).toBeNull();
  });
});

describe('getAcsCodeSections', () => {
  it('keeps the entered code with its section lookup result', () => {
    expect(getAcsCodeSections(['am.ii.a.k1', 'AM.II.O.K1', 'AM.II.Z.K1'])).toEqual([
      {
        code: 'AM.II.A.K1',
        section: expect.objectContaining({ topicId: 'AF-01', name: 'Metallic Structures' }),
      },
      {
        code: 'AM.II.O.K1',
        section: expect.objectContaining({ topicId: 'AF-15', name: 'Water & Waste Systems' }),
      },
      {
        code: 'AM.II.Z.K1',
        section: null,
      },
    ]);
  });
});
