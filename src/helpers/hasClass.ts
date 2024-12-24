/**
 * @param {string} className - Name of the class you wanted to check.
 * @param {Element | HTMLElement} node - Target element you wanted to check.
 * @description Check if the element class has provided class name.
 */
export default (className: string, node: Element | HTMLElement) => {
  return node.classList.contains(className);
};
