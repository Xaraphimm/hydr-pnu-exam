import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HistoryProvider } from '../../src/HistoryContext.jsx';
import AcsPracticeScreen from '../../src/components/AcsPracticeScreen.jsx';
import ExamScreen from '../../src/components/ExamScreen.jsx';
import MockExamScreen from '../../src/components/MockExamScreen.jsx';

describe('ACS section indicators', () => {
  it('shows a compact related section summary when users enter ACS codes', () => {
    render(
      <AcsPracticeScreen
        questionsByTopic={{
          'AF-06': [
            {
              id: 'AF06-1',
              q: 'Hydraulic question',
              a: ['A', 'B', 'C'],
              c: 0,
              exp: 'Explanation',
              ref: 'FAA-H-8083-31',
              acs: 'AM.II.F.K1',
            },
          ],
        }}
        maxQuestions={100}
        isLoading={false}
        initialInput="AM.II.F.K1"
        onBack={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByText('Related section')).toBeInTheDocument();
    expect(screen.getByText('AM.II.F')).toBeInTheDocument();
    expect(screen.getByText('Hydraulic & Pneumatic Systems')).toBeInTheDocument();
  });

  it('shows the current question ACS code and unit without requiring answer feedback', () => {
    render(
      <HistoryProvider>
        <ExamScreen
          questions={[
            {
              id: 'AF-8988',
              q: 'Hydraulic question',
              a: ['A', 'B', 'C'],
              c: 0,
              exp: 'Explanation',
              ref: 'FAA-H-8083-31',
              acs: 'AM.II.F.K1',
            },
          ]}
          answers={{}}
          flagged={new Set()}
          startTime={Date.now()}
          onAnswer={vi.fn()}
          onToggleFlag={vi.fn()}
          onFinish={vi.fn()}
          mode="acs"
          topicId="airframe"
          sessionLabel="ACS Targeted: AM.II.F.K1"
        />
      </HistoryProvider>,
    );

    expect(screen.getByText('AM.II.F.K1')).toBeInTheDocument();
    expect(screen.getByText('Hydraulic & Pneumatic Systems')).toBeInTheDocument();
  });

  it('shows the current mock exam question ACS code and unit', () => {
    render(
      <MockExamScreen
        questions={[
          {
            id: 'AF-8988',
            q: 'Hydraulic question',
            a: ['A', 'B', 'C'],
            c: 0,
            exp: 'Explanation',
            ref: 'FAA-H-8083-31',
            acs: 'AM.II.F.K1',
          },
        ]}
        topicId="airframe"
        onFinish={vi.fn()}
      />,
    );

    expect(screen.getByText('AM.II.F.K1')).toBeInTheDocument();
    expect(screen.getByText('Hydraulic & Pneumatic Systems')).toBeInTheDocument();
  });
});
