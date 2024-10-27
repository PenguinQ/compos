import { BUNDLE_ID_PREFIX } from '../constants';

export default (id: string) => id.startsWith(BUNDLE_ID_PREFIX);
