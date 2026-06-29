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
    expect(screen.getByText('Metallic Structures')).toBeInTheDocument();
    expect(screen.getByText('130 questions')).toBeInTheDocument();
    expect(screen.getByText('Reciprocating Engines')).toBeInTheDocument();
    // All powerplant topics now have authored question banks, so no topic
    // should render the "Study content pending" placeholder.
    expect(screen.queryByText('Study content pending')).toBeNull();
    expect(screen.getAllByText('100 questions').length).toBeGreaterThan(0);
  });
});
