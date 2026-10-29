// 숫자 → 콤마 표시 문자열 (음수 지원)
export const formatNumberInput = (value) => {
  const str = String(value ?? '');
  const isNeg = str.startsWith('-');
  const digits = str.replace(/[^0-9]/g, '');
  if (!digits) return isNeg ? '-' : '';
  return (isNeg ? '-' : '') + Number(digits).toLocaleString('ko-KR');
};

// 콤마 포함 문자열 → 숫자 문자열 (음수 지원)
export const parseNumberInput = (formatted) => {
  const str = String(formatted ?? '');
  const isNeg = str.startsWith('-');
  const digits = str.replace(/[^0-9]/g, '');
  if (!digits) return isNeg ? '-' : '';
  return isNeg ? `-${digits}` : digits;
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);

export const formatWon = (amount) =>
  `${Number(amount || 0).toLocaleString('ko-KR')}원`;

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

export const formatYearMonth = (year, month) =>
  `${year}년 ${String(month).padStart(2, '0')}월`;
