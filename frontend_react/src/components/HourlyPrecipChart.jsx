import React, { useMemo, useState } from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

/**
 * HourlyPrecipChart
 * Visualizes hourly precipitation amount and probability for the next 24 or 48 hours.
 *
 * Accessibility:
 * - Aria labels on container and controls
 * - Tooltip includes units
 * - Uses clear legend and color contrast
 *
 * Data contract:
 * - points: Array<{ time: string, precip_mm?: number|null, precip_prob?: number|null }>
 * - units: { precip: 'mm' | 'inch' }
 */

// PUBLIC_INTERFACE
export default function HourlyPrecipChart({ points, units }) {
  /** Renders a combined bar/area chart for precipitation amount and probability with 24/48h toggle. */
  const [range, setRange] = useState(24);

  const hasData = Array.isArray(points) && points.length > 0;
  const precipUnit = units?.precip === 'inch' ? 'in' : 'mm';

  const data = useMemo(() => {
    return points.slice(0, Math.min(range, points.length)).map((p) => {
      const t = new Date(p.time);
      return {
        timeLabel: t.toLocaleTimeString([], { hour: '2-digit' }),
        // Keep raw values; recharts will handle undefined/null gracefully
        precip: p.precip_mm != null ? Number(p.precip_mm) : null,
        prob: p.precip_prob != null ? Number(p.precip_prob) : null
      };
    });
  }, [points, range]);

  // Accessible tooltip content
  const tooltipFormatter = (value, name) => {
    if (name === 'Precip') {
      return [`${value} ${precipUnit}`, 'Precip'];
    }
    if (name === 'Probability') {
      return [`${value}%`, 'Probability'];
    }
    return [value, name];
  };

  return (
    <div className="card" aria-label="Hourly precipitation chart container">
      <div className="card-title" id="precip-chart-title">Hourly Precipitation</div>

      {!hasData ? (
        <div className="muted">No hourly precipitation data.</div>
      ) : (
        <>
          <div
            className="chart-controls"
            style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}
            aria-label="Chart range controls"
          >
            <span className="muted" id="precip-range-label">Range:</span>
            <div role="group" aria-labelledby="precip-range-label">
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
              Units: {precipUnit} and %
            </span>
          </div>

          <div style={{ width: '100%', height: 280 }} role="img" aria-labelledby="precip-chart-title">
            <ResponsiveContainer>
              <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="timeLabel"
                  stroke="#6b7280"
                  aria-label="Time axis in hours"
                />
                <YAxis
                  yAxisId="left"
                  stroke="#6b7280"
                  tickFormatter={(v) => `${v} ${precipUnit}`}
                  label={{ value: `Precip (${precipUnit})`, position: 'insideLeft', angle: -90, fill: '#6b7280' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#6b7280"
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                  label={{ value: 'Probability (%)', position: 'insideRight', angle: -90, fill: '#6b7280' }}
                />
                <Tooltip
                  formatter={tooltipFormatter}
                  labelFormatter={(label) => `Time: ${label}`}
                  labelStyle={{ color: '#111827' }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Legend verticalAlign="top" height={24} />
                <Bar
                  name="Precip"
                  yAxisId="left"
                  dataKey="precip"
                  fill="#2563EB"
                  opacity={0.85}
                  radius={[4, 4, 0, 0]}
                  aria-label="Hourly precipitation amount bars"
                />
                <Area
                  name="Probability"
                  yAxisId="right"
                  type="monotone"
                  dataKey="prob"
                  stroke="#F59E0B"
                  fill="rgba(245,158,11,0.25)"
                  strokeWidth={2}
                  dot={false}
                  aria-label="Hourly precipitation probability area"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
