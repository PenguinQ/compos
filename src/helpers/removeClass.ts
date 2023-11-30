/**
 * @param {(string | Array)} className - Name of the class you wanted to remove, can be a string or Array.
 * @param {Element | HTMLElement} node - Target element you wanted to remove the classes.
 * @description Remove class to the selected element.
 */
export default (className: string | string[], node: Element | HTMLElement) => {
  if (typeof className === 'string') {
    const classes = className.split(' ');

    if (classes.length > 1) {
      node.classList.remove(...classes);
    } else {
      node.classList.remove(className);
    }
  } else {
    node.classList.remove(...className);
  }
};
