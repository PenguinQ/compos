import lodash from 'lodash';

const { upperFirst, camelCase } = lodash;

const setComponentName = (name: string) => {
  var splittedName = name.split('_');

  return `${upperFirst(camelCase(splittedName.join('_')))}`;
};

export { setComponentName };
