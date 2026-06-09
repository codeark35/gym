import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot,
} from 'recharts';
import type { ProgressEntry } from '../../../types/workout.types';
import { formatDate } from '../../../utils/date.utils';

interface StrengthChartProps {
  data: ProgressEntry[];
  metric: 'maxWeightKg' | 'bestOneRepMax';
}

export default function StrengthChart({ data, metric }: StrengthChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatDate(d.date),
    value: d[metric],
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={formatted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(v) => [`${v} kg`, metric === 'bestOneRepMax' ? '1RM' : 'Peso']}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#212529"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        {formatted.filter((d) => d.isPR).map((d, i) => (
          <ReferenceDot key={i} x={d.label} y={d.value} r={6} fill="#ffc107" stroke="none" />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
