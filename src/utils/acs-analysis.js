import { resolveAcsCode } from '../data/acs-codes.js';

function addCode(group, code, question) {
  let entry = group.codes.find((item) => item.code === code);
  if (!entry) {
    const section = resolveAcsCode(code);
    entry = {
      code,
      text: section?.element?.text ?? '',
      questions: [],
    };
    group.codes.push(entry);
  }
  entry.questions.push(question);
}

function sortGroups(groups, countKey) {
  return groups.sort((a, b) => {
    if (b[countKey] !== a[countKey]) return b[countKey] - a[countKey];
    return a.subject.localeCompare(b.subject);
  });
}

export function summarizeMissedAcsAreas(questions, answers) {
  const bySubject = new Map();

  for (const question of questions ?? []) {
    const section = resolveAcsCode(question.acs);
    if (!section?.subject) continue;

    const isMissed = answers?.[question.id] !== question.c;
    if (!isMissed) continue;

    if (!bySubject.has(section.subject)) {
      bySubject.set(section.subject, {
        subject: section.subject,
        subjectTitle: section.subjectTitle,
        area: section.area,
        areaTitle: section.areaTitle,
        topicId: section.topicId,
        missedCount: 0,
        totalCount: 0,
        codes: [],
      });
    }

    const group = bySubject.get(section.subject);
    group.missedCount += 1;
    group.totalCount += 1;
    addCode(group, section.code, question);
  }

  return sortGroups([...bySubject.values()], 'missedCount');
}

export function summarizeWeakAcsAreas(questionsByTopic, confidence) {
  const bySubject = new Map();

  for (const questions of Object.values(questionsByTopic ?? {})) {
    for (const question of questions ?? []) {
      const section = resolveAcsCode(question.acs);
      if (!section?.subject) continue;

      if (!bySubject.has(section.subject)) {
        bySubject.set(section.subject, {
          subject: section.subject,
          subjectTitle: section.subjectTitle,
          area: section.area,
          areaTitle: section.areaTitle,
          topicId: section.topicId,
          weakCount: 0,
          totalCount: 0,
          codes: [],
        });
      }

      const group = bySubject.get(section.subject);
      group.totalCount += 1;
      const stats = confidence?.[question.id];
      if (stats?.attempts > 0 && stats.level <= 2) {
        group.weakCount += 1;
        addCode(group, section.code, question);
      }
    }
  }

  return sortGroups(
    [...bySubject.values()].filter((group) => group.weakCount > 0),
    'weakCount',
  );
}
