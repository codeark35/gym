import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  dark?: boolean;
}

export default function EmptyState({ icon: Icon, title, description, action, dark = true }: EmptyStateProps) {
  return (
    <div className="text-center py-5 px-3">
      {Icon && <Icon size={48} className={dark ? 'text-white-50 mb-3' : 'text-secondary mb-3'} />}
      <h5 className={`fw-semibold ${dark ? 'text-white' : 'text-dark'}`}>{title}</h5>
      {description && <p className={`small ${dark ? 'text-white-50' : 'text-muted'}`}>{description}</p>}
      {action && (
        <button className="btn btn-primary mt-2" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
