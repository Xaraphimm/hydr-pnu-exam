import { TOPICS } from '../data/topics.js';

const AIRFRAME_ACS_TOPIC_IDS = {
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

export function getAcsSection(acsCode) {
  const normalized = String(acsCode ?? '').trim().toUpperCase().replace(/\.+$/, '');
  const match = normalized.match(/^AM\.II\.([A-O])(?:\.|$)/);
  if (!match) return null;

  const sectionLetter = match[1];
  const topicId = AIRFRAME_ACS_TOPIC_IDS[sectionLetter];
  const topic = TOPICS[topicId];
  if (!topic) return null;

  return {
    code: `AM.II.${sectionLetter}`,
    topicId,
    name: topic.name,
  };
}

export function getAcsSectionLabel(acsCode) {
  return getAcsSection(acsCode)?.name ?? null;
}

export function getAcsSectionSummaries(acsCodes) {
  const seen = new Set();
  const summaries = [];

  for (const code of acsCodes ?? []) {
    const section = getAcsSection(code);
    if (!section || seen.has(section.code)) continue;

    seen.add(section.code);
    summaries.push(section);
  }

  return summaries;
}
