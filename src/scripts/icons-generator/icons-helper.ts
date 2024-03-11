import lodash from 'lodash';

const { upperFirst, camelCase } = lodash;

const setComponentName = (name: string) => {
  const splittedName = name.split('_');

  return `Icon${upperFirst(camelCase(splittedName.join('-')))}`;
};

const setFileName = (name: string) => `icon-${name.split('_').join('-')}`;

export { setComponentName, setFileName };
