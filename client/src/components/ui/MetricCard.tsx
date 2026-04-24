interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}

export default function MetricCard({ label, value, unit, highlight, icon }: MetricCardProps) {
  return (
    <div className={`card metric-card h-100 ${highlight ? 'border-primary' : ''}`}>
      <div className="card-body p-3">
        {icon && <div className="mb-1 text-primary">{icon}</div>}
        <div className={`fw-bold ${typeof value === 'number' && value > 999 ? 'fs-5' : 'fs-4'}`}>
          {value}
          {unit && <span className="fs-6 fw-normal text-muted ms-1">{unit}</span>}
        </div>
        <div className="small text-muted">{label}</div>
      </div>
    </div>
  );
}
