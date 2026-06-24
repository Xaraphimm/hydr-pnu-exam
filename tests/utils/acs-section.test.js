import { describe, expect, it } from 'vitest';
import {
  getAcsSection,
  getAcsSectionLabel,
  getAcsSectionSummaries,
} from '../../src/utils/acs-section.js';

describe('ACS section lookup', () => {
  it('maps full Airframe ACS codes to their related section', () => {
    expect(getAcsSection('am.ii.f.k1')).toEqual({
      code: 'AM.II.F',
      topicId: 'AF-06',
      name: 'Hydraulic & Pneumatic Systems',
    });
  });

  it('maps Airframe ACS prefixes to their related section', () => {
    expect(getAcsSectionLabel('AM.II.I')).toBe('Communication & Navigation Systems');
  });

  it('returns null for unknown or unsupported ACS codes', () => {
    expect(getAcsSection('AM.III.A.K1')).toBeNull();
    expect(getAcsSectionLabel('')).toBeNull();
  });

  it('summarizes entered ACS codes without duplicating repeated sections', () => {
    expect(getAcsSectionSummaries(['AM.II.F.K1', 'AM.II.F.K2', 'AM.II.G.K1'])).toEqual([
      {
        code: 'AM.II.F',
        topicId: 'AF-06',
        name: 'Hydraulic & Pneumatic Systems',
      },
      {
        code: 'AM.II.G',
        topicId: 'AF-07',
        name: 'Environmental Systems',
      },
    ]);
  });
});
