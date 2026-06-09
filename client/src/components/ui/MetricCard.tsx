interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}

export default function MetricCard({ label, value, unit, highlight, icon }: MetricCardProps) {
  return (
    <div className={`card metric-card h-100 ${highlight ? 'border-primary' : ''}`} style={{ borderRadius: 16 }}>
      <div className="card-body p-3">
        {icon && (
          <div className="icon-wrapper mb-2">
            {icon}
          </div>
        )}
        <div className="metric-value">
          {value}
          {unit && <span className="fs-6 fw-normal text-muted ms-1">{unit}</span>}
        </div>
        <div className="metric-label">{label}</div>
      </div>
    </div>
  );
}
