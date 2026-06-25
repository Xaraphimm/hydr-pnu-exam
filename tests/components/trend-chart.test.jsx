import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TrendChart from '../../src/components/TrendChart.jsx';

describe('TrendChart', () => {
  it('renders trends for current saved exam modes', () => {
    render(
      <TrendChart
        attempts={[
          { id: 'a1', mode: 'test', score: 70, total: 100 },
          { id: 'a2', mode: 'study', score: 75, total: 100 },
          { id: 'a3', mode: 'mock', score: 80, total: 100 },
        ]}
      />,
    );

    expect(screen.getByLabelText('Score trend')).toBeInTheDocument();
  });
});
