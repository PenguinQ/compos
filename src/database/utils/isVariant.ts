import { VARIANT_ID_PREFIX } from '../constants';

export default (id: string) => id.startsWith(VARIANT_ID_PREFIX);
