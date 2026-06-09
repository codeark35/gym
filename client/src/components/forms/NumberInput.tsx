import { useRef, type ChangeEvent } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  className?: string;
}

export default function NumberInput({
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  label,
  unit,
  className = '',
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const adjust = (delta: number) => {
    const next = Math.max(min, max ? Math.min(max, value + delta) : value + delta);
    onChange(Math.round(next * 100) / 100);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) onChange(v);
  };

  return (
    <div className={`d-flex flex-column align-items-center ${className}`}>
      {label && <label className="form-label small text-muted mb-1">{label}</label>}
      <div className="input-group" style={{ width: 140 }}>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => adjust(-step)}
          style={{ minWidth: 36 }}
        >
          −
        </button>
        <input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          className="form-control number-input-mobile text-center"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => adjust(step)}
          style={{ minWidth: 36 }}
        >
          +
        </button>
      </div>
      {unit && <span className="small text-muted mt-1">{unit}</span>}
    </div>
  );
}
