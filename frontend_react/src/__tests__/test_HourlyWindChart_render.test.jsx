import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HourlyWindChart from '../components/HourlyWindChart';

function withSizedContainer(ui) {
  return (
    <div style={{ width: 800, height: 400 }}>
      {ui}
    </div>
  );
}

describe('HourlyWindChart', () => {
  const units = { wind: 'kmh' };
  const points = Array.from({ length: 6 }).map((_, i) => ({
    time: new Date(2024, 0, 1, i).toISOString(),
    wind_speed: 5 + i,
    wind_gust: 10 + i
  }));

  it('renders chart container and controls with data', () => {
    render(withSizedContainer(<HourlyWindChart points={points} units={units} />));
    expect(screen.getByLabelText(/Hourly wind chart container/i)).toBeInTheDocument();
    expect(screen.getByText(/Hourly Wind/i)).toBeInTheDocument();

    const btn24 = screen.getByRole('button', { name: /Show next 24 hours/i });
    const btn48 = screen.getByRole('button', { name: /Show next 48 hours/i });
    expect(btn24).toBeInTheDocument();
    expect(btn48).toBeInTheDocument();

    fireEvent.click(btn24);
    expect(btn24).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders empty state when no data', () => {
    render(withSizedContainer(<HourlyWindChart points={[]} units={units} />));
    expect(screen.getByText(/No hourly wind data/i)).toBeInTheDocument();
  });
});
