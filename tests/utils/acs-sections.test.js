import { describe, expect, it } from 'vitest';
import {
  ACS_AREAS,
  getAcsSectionInfo,
  getAcsSectionName,
} from '../../src/utils/acs-sections.js';

describe('getAcsSectionInfo', () => {
  it('resolves a full ACS code to its area and section', () => {
    expect(getAcsSectionInfo('AM.II.F.K1')).toEqual({
      code: 'AM.II.F.K1',
      sectionPrefix: 'AM.II.F',
      area: 'II',
      areaName: 'Airframe',
      sectionName: 'Hydraulic and Pneumatic Systems',
    });
  });

  it('resolves a section prefix without a knowledge element', () => {
    const info = getAcsSectionInfo('AM.II.A');
    expect(info?.sectionName).toBe('Metallic Structures');
    expect(info?.areaName).toBe('Airframe');
  });

  it('normalizes lowercase and whitespace input', () => {
    expect(getAcsSectionName(' am.iii.g.k2 ')).toBe('Engine Lubrication Systems');
  });

  it('maps general and powerplant areas', () => {
    expect(getAcsSectionName('AM.I.H')).toBe('Mathematics');
    expect(getAcsSectionName('AM.III.M')).toBe('Propellers');
  });

  it('returns null for unknown or malformed codes', () => {
    expect(getAcsSectionInfo('AM.II.Z.K1')).toBeNull();
    expect(getAcsSectionInfo('XX.II.F')).toBeNull();
    expect(getAcsSectionInfo('AM.II')).toBeNull();
    expect(getAcsSectionInfo('')).toBeNull();
    expect(getAcsSectionInfo(null)).toBeNull();
  });

  it('exposes the three areas of operation', () => {
    expect(ACS_AREAS).toEqual({ I: 'General', II: 'Airframe', III: 'Powerplant' });
  });
});
