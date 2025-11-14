import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HourlyPrecipChart from '../components/HourlyPrecipChart';

function withSizedContainer(ui) {
  return (
    <div style={{ width: 800, height: 400 }}>
      {ui}
    </div>
  );
}

describe('HourlyPrecipChart', () => {
  const units = { precip: 'mm' };
  const points = Array.from({ length: 6 }).map((_, i) => ({
    time: new Date(2024, 0, 1, i).toISOString(),
    precip_mm: i,
    precip_prob: i * 10
  }));

  it('renders chart container and controls with data', () => {
    render(withSizedContainer(<HourlyPrecipChart points={points} units={units} />));
    expect(screen.getByLabelText(/Hourly precipitation chart container/i)).toBeInTheDocument();
    expect(screen.getByText(/Hourly Precipitation/i)).toBeInTheDocument();

    // Toggle buttons exist
    const btn24 = screen.getByRole('button', { name: /Show next 24 hours/i });
    const btn48 = screen.getByRole('button', { name: /Show next 48 hours/i });
    expect(btn24).toBeInTheDocument();
    expect(btn48).toBeInTheDocument();

    // Toggle range updates aria-pressed
    fireEvent.click(btn48);
    expect(btn48).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders empty state when no data', () => {
    render(withSizedContainer(<HourlyPrecipChart points={[]} units={units} />));
    expect(screen.getByText(/No hourly precipitation data/i)).toBeInTheDocument();
  });
});
