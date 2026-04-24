import { Trophy } from 'lucide-react';

interface PRBadgeProps {
  animate?: boolean;
  size?: 'sm' | 'md';
}

export default function PRBadge({ animate = false, size = 'sm' }: PRBadgeProps) {
  return (
    <span
      className={`badge bg-warning text-dark d-inline-flex align-items-center gap-1 pr-badge ${animate ? 'animate' : ''}`}
      style={{ fontSize: size === 'sm' ? '0.65rem' : '0.8rem' }}
    >
      <Trophy size={size === 'sm' ? 10 : 14} />
      PR
    </span>
  );
}
