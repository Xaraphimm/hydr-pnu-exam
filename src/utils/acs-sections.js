import { TOPICS } from '../data/topics.js';
import { normalizeAcsCode } from './acs-filter.js';

const ACS_AIRFRAME_SECTION_TOPIC_IDS = {
  A: 'AF-01',
  B: 'AF-02',
  C: 'AF-03',
  D: 'AF-04',
  E: 'AF-05',
  F: 'AF-06',
  G: 'AF-07',
  H: 'AF-08',
  I: 'AF-09',
  J: 'AF-10',
  K: 'AF-11',
  L: 'AF-12',
  M: 'AF-13',
  N: 'AF-14',
  O: 'AF-15',
};

const ACS_AIRFRAME_SECTION_PATTERN = /^AM\.II\.([A-O])(?:\.|$)/;

export function getAcsSection(code) {
  const normalizedCode = normalizeAcsCode(code);
  const sectionMatch = normalizedCode.match(ACS_AIRFRAME_SECTION_PATTERN);
  if (!sectionMatch) return null;

  const sectionLetter = sectionMatch[1];
  const topicId = ACS_AIRFRAME_SECTION_TOPIC_IDS[sectionLetter];
  const topic = TOPICS[topicId];
  if (!topic) return null;

  return {
    prefix: `AM.II.${sectionLetter}`,
    topicId,
    name: topic.name,
    subtitle: topic.subtitle,
  };
}

export function getAcsCodeSections(codes) {
  const normalizedCodes = Array.isArray(codes) ? codes.map(normalizeAcsCode).filter(Boolean) : [normalizeAcsCode(codes)].filter(Boolean);

  return normalizedCodes.map((code) => ({
    code,
    section: getAcsSection(code),
  }));
}
