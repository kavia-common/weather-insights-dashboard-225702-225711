import React from 'react';
import { weatherIcon, weatherLabel } from '../lib/icons.js';

// PUBLIC_INTERFACE
function DailyForecast({ items, units }) {
  /** Grid of 7-day forecast cards. */
  if (!items || items.length === 0) {
    return (
      <div className="card">
        <div className="card-title">7-Day Forecast</div>
        <div className="muted">No forecast available.</div>
      </div>
    );
  }

  const tempUnit = units.temperature === 'celsius' ? '°C' : '°F';
  const precipUnit = units.precip === 'mm' ? 'mm' : 'in';

  return (
    <div className="card">
      <div className="card-title">7-Day Forecast</div>
      <div className="forecast-grid">
        {items.slice(0, 7).map((d) => {
          const dt = new Date(d.date);
          const label = dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
          return (
            <div className="forecast-item" key={d.date}>
              <div className="forecast-date">{label}</div>
              <div className="forecast-icon">{weatherIcon(d.weather_code)}</div>
              <div className="forecast-cond">{weatherLabel(d.weather_code)}</div>
              <div className="forecast-temps">
                <span className="max">{d.temperature_2m_max != null ? Math.round(d.temperature_2m_max) : '—'}{tempUnit}</span>
                <span className="min">{d.temperature_2m_min != null ? Math.round(d.temperature_2m_min) : '—'}{tempUnit}</span>
              </div>
              <div className="forecast-extra">
                <span>Precip {d.precipitation_sum != null ? Math.round(d.precipitation_sum) : '—'} {precipUnit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Export memoized to reduce re-renders
export default React.memo(DailyForecast);
