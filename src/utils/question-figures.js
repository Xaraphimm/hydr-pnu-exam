const FIGURE_PATTERN = /refer\s+to\s+figure\s+(\d+)/i;

function normalizeFigureNumber(value) {
  const match = String(value ?? '').match(FIGURE_PATTERN);
  return match ? Number(match[1]) : null;
}

export function getQuestionFigure(question, defaultCategory = 'airframe') {
  if (!question) return null;

  if (question.figure?.src) {
    return {
      label: question.figure.label ?? 'Figure',
      src: question.figure.src,
    };
  }

  const number = normalizeFigureNumber(question.diagram) ?? normalizeFigureNumber(question.q);
  if (!number) return null;

  return {
    label: `Figure ${number}`,
    src: `/figures/${defaultCategory}/figure-${number}.png`,
  };
}

export function getFigureCategory(question, fallbackCategory = 'airframe') {
  if (question?.acs?.startsWith('AM.III.')) return 'powerplant';
  if (question?.acs?.startsWith('AM.II.')) return 'airframe';
  return fallbackCategory;
}
