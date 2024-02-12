import { monotonicFactory } from 'ulidx';
import {
  BUNDLE_ID_PREFIX,
  PRODUCT_ID_PREFIX,
  VARIANT_ID_PREFIX,
} from '../constants';

export default (type: string) => {
  const ulid = monotonicFactory();

  if (type === 'bundle') {
    return BUNDLE_ID_PREFIX + ulid();
  } else if (type === 'variant') {
    return VARIANT_ID_PREFIX + ulid();
  }

  return PRODUCT_ID_PREFIX + ulid();
};
