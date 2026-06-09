import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

interface PRBadgeProps {
  animate?: boolean;
  size?: 'sm' | 'md';
}

export default function PRBadge({ animate = false, size = 'sm' }: PRBadgeProps) {
  const [showConfetti, setShowConfetti] = useState(animate);

  useEffect(() => {
    if (animate) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(t);
    }
  }, [animate]);

  return (
    <span
      className={`badge text-white d-inline-flex align-items-center gap-1 pr-badge ${animate ? 'animate' : ''}`}
      style={{ fontSize: size === 'sm' ? '0.65rem' : '0.8rem' }}
    >
      <Trophy size={size === 'sm' ? 10 : 14} />
      PR
      {showConfetti && (
        <span className="confetti">
          {'✨'.repeat(3)}
        </span>
      )}
    </span>
  );
}
