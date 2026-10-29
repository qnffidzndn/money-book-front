import { useEffect, useRef, useState } from 'react';
import './YearMonthPicker.css';

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export default function YearMonthPicker({ ym, onChange }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => Number(ym.split('-')[0]));
  const ref = useRef(null);

  const selYear = Number(ym.split('-')[0]);
  const selMonth = Number(ym.split('-')[1]);

  useEffect(() => {
    if (open) setViewYear(selYear);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const move = (delta) => {
    const d = new Date(selYear, selMonth - 1 + delta, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleSelect = (month) => {
    onChange(`${viewYear}-${String(month).padStart(2, '0')}`);
    setOpen(false);
  };

  return (
    <div className="ym-picker" ref={ref}>
      <div className="month-selector">
        <button className="month-btn" onClick={() => move(-1)}>{'<'}</button>
        <button className="ym-trigger" onClick={() => setOpen((o) => !o)}>
          {selYear}년 {String(selMonth).padStart(2, '0')}월
        </button>
        <button className="month-btn" onClick={() => move(1)}>{'>'}</button>
      </div>

      {open && (
        <div className="ym-popup">
          <div className="ym-year-nav">
            <button className="ym-nav-btn" onClick={() => setViewYear((y) => y - 1)}>‹</button>
            <span className="ym-year-label">{viewYear}년</span>
            <button className="ym-nav-btn" onClick={() => setViewYear((y) => y + 1)}>›</button>
          </div>
          <div className="ym-months">
            {MONTHS.map((label, i) => {
              const month = i + 1;
              const isSelected = viewYear === selYear && month === selMonth;
              return (
                <button
                  key={month}
                  className={`ym-month${isSelected ? ' selected' : ''}`}
                  onClick={() => handleSelect(month)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
