import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-5 px-3">
      {Icon && <Icon size={48} className="text-secondary mb-3" />}
      <h5 className="fw-semibold">{title}</h5>
      {description && <p className="text-muted small">{description}</p>}
      {action && (
        <button className="btn btn-primary mt-2" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
