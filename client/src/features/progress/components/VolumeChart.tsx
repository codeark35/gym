import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { formatDateShort } from '../../../utils/date.utils';

interface VolumePoint {
  date?: string;
  week?: string;
  totalVolume: number;
}

interface VolumeChartProps {
  data: VolumePoint[];
}

interface TooltipPayload {
  value: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
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
        <div className="fw-bold" style={{ color: '#38bdf8' }}>
          {payload[0].value.toLocaleString()} kg
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Volumen total</div>
      </div>
    );
  }
  return null;
};

function formatLabel(d: VolumePoint): string {
  if (d.date) return formatDateShort(d.date);
  if (d.week) return d.week;
  return '';
}

export default function VolumeChart({ data }: VolumeChartProps) {
  const formatted = useMemo(
    () => data.map((d) => ({
      ...d,
      label: formatLabel(d),
      totalVolume: Math.round(d.totalVolume),
    })),
    [data],
  );

  const maxVol = useMemo(
    () => Math.max(...formatted.map((d) => d.totalVolume), 1),
    [formatted],
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
        <defs>
          <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          interval="preserveStartEnd"
          angle={-30}
          textAnchor="end"
          height={40}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="totalVolume" radius={[6, 6, 0, 0]}>
          {formatted.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.totalVolume === maxVol ? '#fbbf24' : 'url(#volGradient)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
