export default (number: number) => {
  const formatted = new Intl.NumberFormat('id-ID', { currency: 'IDR' }).format(number);

  return formatted ? `Rp${formatted}` : 'Rp0';
};
