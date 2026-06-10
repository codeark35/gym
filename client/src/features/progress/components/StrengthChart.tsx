import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ReferenceDot,
} from 'recharts';
import type { ProgressEntry } from '../../../types/workout.types';

interface StrengthChartProps {
  data: ProgressEntry[];
  metric: 'maxWeightKg' | 'bestOneRepMax';
}

const CustomTooltip = ({ active, payload, label, metric }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div
        className="px-3 py-2"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          color: '#fff',
          fontSize: '0.8125rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 2 }}>{label}</div>
        <div className="fw-bold" style={{ color: '#fbbf24' }}>
          {value} kg
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
          {metric === 'bestOneRepMax' ? '1RM estimado' : 'Peso máx.'}
        </div>
      </div>
    );
  }
  return null;
};

export default function StrengthChart({ data, metric }: StrengthChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: d.date,
    value: d[metric],
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="strengthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip metric={metric} />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="none"
          fill="url(#strengthGradient)"
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#fbbf24"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#0f172a', stroke: '#fbbf24', strokeWidth: 2 }}
          activeDot={{ r: 5, fill: '#fbbf24', stroke: '#fff', strokeWidth: 2 }}
        />
        {formatted.filter((d) => d.isPR).map((d, i) => (
          <ReferenceDot
            key={i}
            x={d.label}
            y={d.value}
            r={6}
            fill="#ffc107"
            stroke="#0f172a"
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
