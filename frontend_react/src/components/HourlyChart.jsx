import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

// PUBLIC_INTERFACE
export default function HourlyChart({ points, units }) {
  /** Lightweight hourly temperature line chart for next 24-48 hours. */
  if (!points || points.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Hourly Temperature</div>
        <div className="muted">No hourly data.</div>
      </div>
    );
  }
  const fmt = points.slice(0, 24).map((p) => ({
    time: new Date(p.time).toLocaleTimeString([], { hour: '2-digit' }),
    temp: p.temperature_2m != null ? Math.round(p.temperature_2m) : null
  }));
  const tempUnit = units.temperature === 'celsius' ? '°C' : '°F';

  return (
    <div className="card">
      <div className="card-title">Hourly Temperature</div>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={fmt} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(v) => `${v}${tempUnit}`} />
            <Tooltip
              formatter={(value: any) => [`${value}${tempUnit}`, 'Temp']}
              labelStyle={{ color: '#111827' }}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Line type="monotone" dataKey="temp" stroke="#2563EB" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
