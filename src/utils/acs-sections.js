import { normalizeAcsCode } from './acs-filter.js';

export const ACS_AREAS = {
  I: 'General',
  II: 'Airframe',
  III: 'Powerplant',
};

// Section names follow the FAA Aviation Mechanic ACS (FAA-S-ACS-1).
// Keys are area-qualified section prefixes, e.g. "AM.II.F".
export const ACS_SECTIONS = {
  // I. General
  'AM.I.A': 'Fundamentals of Electricity and Electronics',
  'AM.I.B': 'Aircraft Drawings',
  'AM.I.C': 'Weight and Balance',
  'AM.I.D': 'Fluid Lines and Fittings',
  'AM.I.E': 'Aircraft Materials, Hardware, and Processes',
  'AM.I.F': 'Ground Operations and Servicing',
  'AM.I.G': 'Cleaning and Corrosion Control',
  'AM.I.H': 'Mathematics',
  'AM.I.I': 'Regulations, Maintenance Forms, Records, and Publications',
  'AM.I.J': 'Physics for Aviation',
  'AM.I.K': 'Inspection Concepts and Techniques',
  'AM.I.L': 'Human Factors',

  // II. Airframe
  'AM.II.A': 'Metallic Structures',
  'AM.II.B': 'Non-Metallic Structures',
  'AM.II.C': 'Flight Controls',
  'AM.II.D': 'Airframe Inspection',
  'AM.II.E': 'Landing Gear Systems',
  'AM.II.F': 'Hydraulic and Pneumatic Systems',
  'AM.II.G': 'Environmental Systems',
  'AM.II.H': 'Aircraft Instrument Systems',
  'AM.II.I': 'Communications, Light Signals, and Runway Lighting Systems',
  'AM.II.J': 'Aircraft Fuel Systems',
  'AM.II.K': 'Aircraft Electrical Systems',
  'AM.II.L': 'Ice and Rain Control Systems',
  'AM.II.M': 'Airframe Fire Protection Systems',
  'AM.II.N': 'Rotorcraft Fundamentals',
  'AM.II.O': 'Water and Waste Systems',

  // III. Powerplant
  'AM.III.A': 'Reciprocating Engines',
  'AM.III.B': 'Turbine Engines',
  'AM.III.C': 'Engine Inspection',
  'AM.III.D': 'Engine Instrument Systems',
  'AM.III.E': 'Engine Fire Protection Systems',
  'AM.III.F': 'Engine Electrical Systems',
  'AM.III.G': 'Engine Lubrication Systems',
  'AM.III.H': 'Ignition and Starting Systems',
  'AM.III.I': 'Engine Fuel and Fuel Metering Systems',
  'AM.III.J': 'Reciprocating Engine Induction and Cooling Systems',
  'AM.III.K': 'Turbine Engine Air Systems',
  'AM.III.L': 'Engine Exhaust and Reverser Systems',
  'AM.III.M': 'Propellers',
};

/**
 * Resolve a full ACS code or prefix to its area and section metadata.
 * Accepts inputs like "AM.II.F", "AM.II.F.K1", or "am.iii.g.k2".
 * Returns null when the code cannot be mapped to a known section.
 */
export function getAcsSectionInfo(code) {
  const normalized = normalizeAcsCode(code);
  if (!normalized) return null;

  const parts = normalized.split('.');
  if (parts.length < 3) return null;

  const [prefix, area, section] = parts;
  if (prefix !== 'AM') return null;

  const sectionPrefix = `${prefix}.${area}.${section}`;
  const sectionName = ACS_SECTIONS[sectionPrefix];
  if (!sectionName) return null;

  return {
    code: normalized,
    sectionPrefix,
    area,
    areaName: ACS_AREAS[area] ?? null,
    sectionName,
  };
}

/** Short, human-readable label for an ACS code, e.g. "Hydraulic and Pneumatic Systems". */
export function getAcsSectionName(code) {
  return getAcsSectionInfo(code)?.sectionName ?? null;
}
