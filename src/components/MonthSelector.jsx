import './MonthSelector.css';

export default function MonthSelector({ ym, onChange }) {
  const [year, month] = ym.split('-').map(Number);

  const move = (delta) => {
    const d = new Date(year, month - 1 + delta, 1);
    const ny = d.getFullYear();
    const nm = String(d.getMonth() + 1).padStart(2, '0');
    onChange(`${ny}-${nm}`);
  };

  return (
    <div className="month-selector">
      <button className="month-btn" onClick={() => move(-1)}>{'<'}</button>
      <span className="month-label">{year}년 {String(month).padStart(2, '0')}월</span>
      <button className="month-btn" onClick={() => move(1)}>{'>'}</button>
    </div>
  );
}
