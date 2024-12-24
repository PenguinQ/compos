/**
 * @param {string} className - Name of the class you wanted to check.
 * @param {Element | HTMLElement} node - Target element you wanted to check.
 * @description Check if the element has class starts with the class provided.
 */
export default (className: string, node: Element | HTMLElement) => {
  for (const nodeClass of node.classList) {
    if (nodeClass.startsWith(className)) return true;
  }

  return false;
};
