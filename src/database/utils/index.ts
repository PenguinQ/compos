import { monotonicFactory } from 'ulidx';
import { BUNDLE_PREFIX, PRODUCT_PREFIX, VARIANT_PREFIX } from '@database/constants';

export const generateId = (type: string) => {
  const ulid = monotonicFactory();

  if (type === 'bundle') {
    return BUNDLE_PREFIX + ulid();
  } else if (type === 'variant') {
    return VARIANT_PREFIX + ulid();
  }

  return PRODUCT_PREFIX + ulid();
};
