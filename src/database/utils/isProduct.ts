import { PRODUCT_ID_PREFIX } from '../constants';

export default (id: string) => id.startsWith(PRODUCT_ID_PREFIX);
