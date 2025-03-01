export default (value: string | number): string | number => {
  // Delete thes since javascript is automatically remove leading 0 on any number
  if (typeof value === 'number') return Number(value.toString().replace(/^0+/, '') || '0');

  if (/^0+$/.test(value)) return '0';

  return value.replace(/^0+/, '');
};
