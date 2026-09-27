export function formatCurrency(amount: number = 0, currencyCode: string = 'INR'): string {
  const num = Number(amount) || 0;
  
  if (!currencyCode || currencyCode.toUpperCase() === 'INR' || currencyCode === '₹') {
    return `₹${num.toLocaleString('en-IN')}`;
  }

  if (currencyCode.toUpperCase() === 'USD' || currencyCode === '$') {
    return `$${num.toLocaleString('en-US')}`;
  }

  if (currencyCode.toUpperCase() === 'EUR' || currencyCode === '€') {
    return `€${num.toLocaleString('en-US')}`;
  }

  return `${num.toLocaleString()} ${currencyCode}`;
}
