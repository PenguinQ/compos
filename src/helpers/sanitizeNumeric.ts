export default (number: string) => {
  if (typeof number === 'number') return number;

  const digits = number.replace(/[^0-9]/g, '');

  if (digits.length > 1 && digits.charAt(0) === '0') return digits.replace(/^0+/g, '');

  return digits;
};
