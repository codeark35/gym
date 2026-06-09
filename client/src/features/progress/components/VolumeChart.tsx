import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatDate } from '../../../utils/date.utils';

interface VolumeChartProps {
  data: { date?: string; week?: string; totalVolume: number }[];
}

export default function VolumeChart({ data }: VolumeChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatDate((d.date ?? d.week)!),
    totalVolume: Math.round(d.totalVolume),
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={formatted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [`${v} kg`, 'Volumen']} />
        <Bar dataKey="totalVolume" fill="#212529" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
