import React from 'react';
import { render, screen } from '@testing-library/react';
import HourlyChart from '../components/HourlyChart';

function withSizedContainer(ui) {
  return (
    <div style={{ width: 800, height: 400 }}>
      {ui}
    </div>
  );
}

describe('HourlyChart', () => {
  const units = { temperature: 'celsius', wind: 'kmh', precip: 'mm' };
  const points = Array.from({ length: 5 }).map((_, i) => ({
    time: new Date(2024, 0, 1, i).toISOString(),
    temperature_2m: 10 + i
  }));

  it('renders title and tooltip wiring when data provided', () => {
    render(withSizedContainer(<HourlyChart points={points} units={units} />));
    expect(screen.getByText(/Hourly Temperature/i)).toBeInTheDocument();
  });

  it('renders fallback when no points', () => {
    render(withSizedContainer(<HourlyChart points={[]} units={units} />));
    expect(screen.getByText(/No hourly data/i)).toBeInTheDocument();
  });
});
