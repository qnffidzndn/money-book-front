export const formatCurrency = (amount) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

export const formatYearMonth = (year, month) =>
  `${year}년 ${String(month).padStart(2, '0')}월`;
