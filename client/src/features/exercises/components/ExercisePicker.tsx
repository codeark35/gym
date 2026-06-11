import { useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { useExercises } from '../hooks/useExercises';
import type { Exercise, MuscleGroup } from '../../../types/workout.types';
import { MUSCLE_GROUP_LABELS } from '../../../types/workout.types';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { Search } from 'lucide-react';

interface ExercisePickerProps {
  show: boolean;
  onHide: () => void;
  onSelect: (exercise: Exercise) => void;
}

const MUSCLE_GROUPS = Object.entries(MUSCLE_GROUP_LABELS) as [MuscleGroup, string][];

export default function ExercisePicker({ show, onHide, onSelect }: ExercisePickerProps) {
  const { data: exercises = [], isLoading } = useExercises();
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<MuscleGroup | null>(null);

  const filtered = exercises.filter((ex) => {
    const matchesQuery =
      !query ||
      ex.name.toLowerCase().includes(query.toLowerCase()) ||
      (ex.nameEs ?? '').toLowerCase().includes(query.toLowerCase());
    const matchesGroup = !activeGroup || ex.muscleGroup === activeGroup;
    return matchesQuery && matchesGroup;
  });

  return (
    <Offcanvas show={show} onHide={onHide} placement="bottom" style={{ height: '85vh' }}>
      <Offcanvas.Header closeButton className="border-bottom pb-2">
        <Offcanvas.Title className="fw-bold">Elegir ejercicio</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="p-0 d-flex flex-column">
        {/* Search bar */}
        <div className="px-3 pt-3 pb-2 position-sticky top-0 bg-white border-bottom">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              type="search"
              className="form-control"
              placeholder="Buscar ejercicio..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Muscle group chips */}
          <div className="d-flex gap-1 mt-2 overflow-auto pb-1 flex-nowrap">
            <button
              className={`btn btn-sm flex-shrink-0 muscle-chip ${!activeGroup ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setActiveGroup(null)}
            >
              Todos
            </button>
            {MUSCLE_GROUPS.map(([key, label]) => (
              <button
                key={key}
                className={`btn btn-sm flex-shrink-0 muscle-chip ${activeGroup === key ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setActiveGroup(activeGroup === key ? null : key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise list */}
        <div className="overflow-auto flex-grow-1">
          {isLoading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <p className="text-muted text-center py-4 small">No se encontraron ejercicios</p>
          ) : (
                <ul className="list-group list-group-flush">
              {filtered.map((ex) => (
                <li
                  key={ex.id}
                  className="list-group-item list-group-item-action py-2 px-3 d-flex align-items-center gap-3"
                  style={{ cursor: 'pointer', minHeight: 64 }}
                  onClick={() => onSelect(ex)}
                >
                  {ex.imageUrl ? (
                    <img
                      src={ex.imageUrl}
                      alt={ex.name}
                      className="flex-shrink-0"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        objectFit: 'cover',
                        background: '#f1f5f9',
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="flex-shrink-0 d-flex align-items-center justify-content-center"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #1e3a5f, #2d4a6f)',
                      }}
                    >
                      <span style={{ color: '#fbbf24', fontSize: '1.25rem', fontWeight: 700 }}>
                        {ex.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-medium text-truncate">{ex.nameEs ?? ex.name}</div>
                    <div className="small text-muted">
                      {MUSCLE_GROUP_LABELS[ex.muscleGroup as MuscleGroup]}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
