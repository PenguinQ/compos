export default (dirty: string): string | null => {
  if (typeof dirty !== 'string') return null;

  const isNegative = dirty.trim().startsWith('-');
  const digits     = dirty.replace(/[^0-9]/g, '');

  if (digits.length > 1 && digits.charAt(0) === '0') return digits.replace(/^0+/g, '');

  return `${isNegative ? '-' : ''}${digits}`;
};
