import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HistoryProvider } from '../../src/HistoryContext.jsx';
import TopicListScreen from '../../src/components/TopicListScreen.jsx';

function renderTopicList() {
  return render(
    <HistoryProvider>
      <TopicListScreen
        onSelectTopic={vi.fn()}
        onStartExam={vi.fn()}
        onStartAcsPractice={vi.fn()}
        onStartCustomExam={vi.fn()}
        onViewCategoryHistory={vi.fn()}
        onStartReadinessStudy={vi.fn()}
      />
    </HistoryProvider>,
  );
}

describe('TopicListScreen', () => {
  it('shows production availability states on first load', () => {
    renderTopicList();

    expect(screen.getByText('PHNX FOUNDRIES')).toBeInTheDocument();
    expect(screen.getByText('Full Airframe Exam')).toBeInTheDocument();
    expect(screen.getByText('Available Powerplant Exam')).toBeInTheDocument();
    expect(screen.getAllByText('Custom Test Builder')).toHaveLength(2);
    expect(screen.getByText('Metallic Structures')).toBeInTheDocument();
    expect(screen.getByText('130 questions')).toBeInTheDocument();
    expect(screen.getByText('Reciprocating Engines')).toBeInTheDocument();
    expect(screen.getAllByText('Study content pending').length).toBeGreaterThan(0);
  });
});
