import { Flame, Trophy, CalendarDays } from 'lucide-react';
import { todayISO } from '../../../utils/date.utils';

interface StreakCardProps {
  current: number;
  longest: number;
}

export default function StreakCard({ current, longest }: StreakCardProps) {
  const isRecord = current >= longest && current > 0;
  const hasStreak = current > 0;

  // Generate last 7 days dots aligned with getDay() (0=Sun..6=Sat)
  const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  // Use UTC noon so getDay() matches the app timezone day
  const todayIndex = new Date(todayISO() + 'T12:00:00Z').getDay();
  const activeIndices = new Set<number>();

  // Fill active days for streak (last N days including today)
  for (let i = 0; i < Math.min(current, 7); i++) {
    const idx = (todayIndex - i + 7) % 7;
    activeIndices.add(idx);
  }

  return (
    <div className="card" style={{ border: 'none', borderRadius: 20, overflow: 'hidden' }}>
      <div className="card-body p-0 position-relative">
        {/* Background gradient with warm glow */}
        <div
          className="position-relative"
          style={{
            background: hasStreak
              ? 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 40%, #1e3a5f 100%)'
              : 'linear-gradient(135deg, #334155 0%, #475569 100%)',
            overflow: 'hidden',
          }}
        >
          {/* Decorative warm glow for active streaks */}
          {hasStreak && (
            <>
              <div
                className="position-absolute"
                style={{
                  top: -60, right: -30,
                  width: 180, height: 180,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
                }}
              />
              <div
                className="position-absolute"
                style={{
                  bottom: -40, left: -20,
                  width: 140, height: 140,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
                }}
              />
            </>
          )}

          <div className="p-4 position-relative">
            {/* Top row: icon + record badge */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: 44, height: 44,
                    background: hasStreak ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.08)',
                    border: hasStreak ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Flame size={22} style={{ color: hasStreak ? '#fbbf24' : '#94a3b8' }} />
                </div>
                <div>
                  <div className="text-white fw-bold" style={{ fontSize: '0.9375rem' }}>
                    Racha actual
                  </div>
                  <div className="small" style={{ color: '#94a3b8' }}>
                    {hasStreak ? 'Seguís firme' : 'Empezá hoy'}
                  </div>
                </div>
              </div>
              {isRecord && current > 0 && (
                <div
                  className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                  style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <Trophy size={12} style={{ color: '#fbbf24' }} />
                  <span className="small fw-semibold" style={{ color: '#fbbf24', fontSize: '0.6875rem' }}>
                    RÉCORD
                  </span>
                </div>
              )}
            </div>

            {/* Big number */}
            <div className="d-flex align-items-baseline gap-2 mb-1">
              <span
                className="fw-bold"
                style={{
                  fontSize: '4rem',
                  lineHeight: 1,
                  color: hasStreak ? '#fbbf24' : '#94a3b8',
                  letterSpacing: -2,
                }}
              >
                {current}
              </span>
              <span className="fw-semibold text-white" style={{ fontSize: '1.125rem' }}>
                días
              </span>
            </div>

            {/* Weekly dots */}
            <div className="d-flex align-items-center gap-1 mt-3">
              {weekDays.map((day, i) => {
                const isActive = activeIndices.has(i);
                return (
                  <div key={i} className="d-flex flex-column align-items-center gap-1 flex-fill">
                    <div
                      style={{
                        width: 28, height: 28,
                        borderRadius: '50%',
                        background: isActive ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.06)',
                        border: isActive ? '2px solid rgba(245, 158, 11, 0.5)' : '2px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isActive && (
                        <div
                          style={{
                            width: 8, height: 8,
                            borderRadius: '50%',
                            background: '#fbbf24',
                            boxShadow: '0 0 8px rgba(251, 191, 36, 0.5)',
                          }}
                        />
                      )}
                    </div>
                    <span
                      className="small"
                      style={{
                        fontSize: '0.625rem',
                        color: isActive ? '#fbbf24' : '#64748b',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom info */}
            <div className="d-flex align-items-center justify-content-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="d-flex align-items-center gap-1">
                <CalendarDays size={14} style={{ color: '#64748b' }} />
                <span className="small" style={{ color: '#64748b' }}>
                  Récord: {longest} días
                </span>
              </div>
              {hasStreak && (
                <span className="small fw-semibold" style={{ color: '#fbbf24' }}>
                  ¡Mantelo!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
