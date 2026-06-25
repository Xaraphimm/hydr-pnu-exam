import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MockExamScreen from '../../src/components/MockExamScreen.jsx';

const questions = [
  {
    id: 'AF05-1',
    q: 'Question one',
    a: ['A', 'B', 'C'],
    c: 0,
    exp: 'Explanation',
    ref: 'Reference',
    acs: 'AM.II.E.K2',
    diagram: null,
  },
  {
    id: 'AF05-2',
    q: 'Question two',
    a: ['A', 'B', 'C'],
    c: 1,
    exp: 'Explanation',
    ref: 'Reference',
    acs: 'AM.II.E.K3',
    diagram: null,
  },
];

describe('MockExamScreen', () => {
  it('returns flagged questions when the exam finishes', () => {
    window.confirm = vi.fn(() => true);
    const onFinish = vi.fn();

    render(<MockExamScreen questions={questions} topicId="AF-05" onFinish={onFinish} />);

    fireEvent.click(screen.getByTitle('Flag for review'));
    fireEvent.click(screen.getByText('Finish Exam'));

    expect(onFinish).toHaveBeenCalledWith({}, new Set(['AF05-1']));
  });
});
