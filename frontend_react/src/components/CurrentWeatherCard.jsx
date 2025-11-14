import React from 'react';
import { weatherIcon, weatherLabel } from '../lib/icons.js';

// PUBLIC_INTERFACE
function CurrentWeatherCard({ locationLabel, current, units }) {
  /** Surface card showing current conditions with icon and stats. */
  if (!current) {
    return (
      <div className="card">
        <div className="card-title">Current Weather</div>
        <div className="muted">No data. Select a location.</div>
      </div>
    );
  }

  const tempUnit = units.temperature === 'celsius' ? '°C' : '°F';
  const windUnit = units.wind === 'kmh' ? 'km/h' : 'mph';

  return (
    <div className="card">
      <div className="card-title">Current Weather</div>
      <div className="current-content">
        <div className="current-left">
          <div className="icon">{weatherIcon(current.weather_code)}</div>
          <div className="status">
            <div className="loc">{locationLabel}</div>
            <div className="cond">{weatherLabel(current.weather_code)}</div>
          </div>
        </div>
        <div className="current-right">
          <div className="metric">
            <div className="metric-label">Temperature</div>
            <div className="metric-value">
              {current.temperature_2m != null ? Math.round(current.temperature_2m) : '—'} {tempUnit}
            </div>
          </div>
          <div className="metric">
            <div className="metric-label">Feels like</div>
            <div className="metric-value">
              {current.apparent_temperature != null ? Math.round(current.apparent_temperature) : '—'} {tempUnit}
            </div>
          </div>
          <div className="metric">
            <div className="metric-label">Humidity</div>
            <div className="metric-value">
              {current.relative_humidity_2m != null ? Math.round(current.relative_humidity_2m) : '—'} %
            </div>
          </div>
          <div className="metric">
            <div className="metric-label">Wind</div>
            <div className="metric-value">
              {current.wind_speed_10m != null ? Math.round(current.wind_speed_10m) : '—'} {windUnit}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export memoized to avoid re-renders on unrelated state changes
export default React.memo(CurrentWeatherCard);
