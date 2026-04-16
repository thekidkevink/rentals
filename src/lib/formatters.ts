export function formatCurrency(amount: number) {
  const formattedNumber = new Intl.NumberFormat('en-NA', {
    maximumFractionDigits: 0,
  }).format(amount);

  return `N$${formattedNumber}`;
}

export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-NA', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}
