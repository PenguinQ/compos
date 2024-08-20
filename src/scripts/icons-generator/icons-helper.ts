import lodash from 'lodash';
import type { ContentType } from './types.ts';

const { upperFirst, camelCase } = lodash;

const setIconName = (name: string) => {
  return `${upperFirst(camelCase(name))}`;
};

const setFileName = (name: string) => name;

const sortIcon = (icons: ContentType[]) => icons.sort((a, b) => {
  const nameA = a.name.toUpperCase();
  const nameB = b.name.toUpperCase();

  if (nameA < nameB) return -1;

  if (nameA > nameB) return 1;

  return 0;
});

export {
  setFileName,
  setIconName,
  sortIcon,
};
