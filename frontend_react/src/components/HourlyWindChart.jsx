import React, { useMemo, useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

/**
 * HourlyWindChart
 * Visualizes hourly wind speed and gusts for the next 24 or 48 hours.
 *
 * Accessibility:
 * - Aria labels on chart container and controls
 * - Tooltip includes units and clear labels
 * - Legend for series identification
 *
 * Data contract:
 * - points: Array<{ time: string, wind_speed?: number|null, wind_gust?: number|null }>
 * - units: { wind: 'kmh' | 'mph' }
 */

// PUBLIC_INTERFACE
export default function HourlyWindChart({ points, units }) {
  /** Renders a combined line/area chart for wind speed and gusts with 24/48h toggle. */
  const [range, setRange] = useState(24);

  const hasData = Array.isArray(points) && points.length > 0;
  const windUnit = units?.wind === 'mph' ? 'mph' : 'km/h';

  const data = useMemo(() => {
    if (!hasData) return [];
    return points.slice(0, Math.min(range, points.length)).map((p) => {
      const t = new Date(p.time);
      return {
        timeLabel: t.toLocaleTimeString([], { hour: '2-digit' }),
        wind: p.wind_speed != null ? Number(p.wind_speed) : null,
        gust: p.wind_gust != null ? Number(p.wind_gust) : null,
      };
    });
  }, [points, range, hasData]);

  const tooltipFormatter = (value, name) => {
    if (name === 'Wind') {
      return [`${value} ${windUnit}`, 'Wind'];
    }
    if (name === 'Gust') {
      return [`${value} ${windUnit}`, 'Gust'];
    }
    return [value, name];
  };

  return (
    <div className="card" aria-label="Hourly wind chart container">
      <div className="card-title" id="wind-chart-title">Hourly Wind</div>

      {!hasData ? (
        <div className="muted">No hourly wind data.</div>
      ) : (
        <>
          <div
            className="chart-controls"
            style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}
            aria-label="Wind chart range controls"
          >
            <span className="muted" id="wind-range-label">Range:</span>
            <div role="group" aria-labelledby="wind-range-label">
              <button
                className="btn-ghost"
                aria-pressed={range === 24}
                aria-label="Show next 24 hours"
                onClick={() => setRange(24)}
                style={{ padding: '6px 10px', marginRight: 6 }}
              >
                24h
              </button>
              <button
                className="btn-ghost"
                aria-pressed={range === 48}
                aria-label="Show next 48 hours"
                onClick={() => setRange(48)}
                style={{ padding: '6px 10px' }}
              >
                48h
              </button>
            </div>
            <span className="muted" aria-live="polite" style={{ marginLeft: 'auto', fontSize: 12 }}>
              Units: {windUnit}
            </span>
          </div>

          <div style={{ width: '100%', height: 280 }} role="img" aria-labelledby="wind-chart-title">
            <ResponsiveContainer>
              <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="timeLabel"
                  stroke="#6b7280"
                  aria-label="Time axis in hours"
                />
                <YAxis
                  stroke="#6b7280"
                  tickFormatter={(v) => `${v} ${windUnit}`}
                  label={{ value: `Wind (${windUnit})`, position: 'insideLeft', angle: -90, fill: '#6b7280' }}
                />
                <Tooltip
                  formatter={tooltipFormatter}
                  labelFormatter={(label) => `Time: ${label}`}
                  labelStyle={{ color: '#111827' }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Legend verticalAlign="top" height={24} />
                <Line
                  name="Wind"
                  type="monotone"
                  dataKey="wind"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={false}
                  aria-label="Hourly wind speed line"
                />
                <Area
                  name="Gust"
                  type="monotone"
                  dataKey="gust"
                  stroke="#F59E0B"
                  fill="rgba(245,158,11,0.25)"
                  strokeWidth={2}
                  dot={false}
                  aria-label="Hourly wind gusts area"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
