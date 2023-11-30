/**
 * @param {(string | Array)} className - Name of the class you wanted to add, can be a string or Array.
 * @param {Element | HTMLElement} node - Target element you wanted to add the classes.
 * @description Add class to the selected element.
 */
export default (className: string | string[], node: Element | HTMLElement) => {
  if (typeof className === 'string') {
    const classes = className.split(' ');

    if (classes.length > 1) {
      node.classList.add(...classes);
    } else {
      node.classList.add(className);
    }
  } else {
    node.classList.add(...className);
  }
};
