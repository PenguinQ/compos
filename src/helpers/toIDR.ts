export default (number: number | string) => {
  const formatted = new Intl.NumberFormat('id-ID', { currency: 'IDR' }).format(number as any);

  return formatted ? `Rp${formatted}` : 'Rp0';
};
