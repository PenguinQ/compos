export default (
  elements: Element[],
  options: {
    target?: string;
    attributeName: string;
    attributeValue: string;
  }
) => {
  const { target, attributeName, attributeValue } = options;

  for (const element of elements) {
    if (target) {
      const child = element.querySelector(target);

      child && child.setAttribute(attributeName, attributeValue);
    } else {
      element.setAttribute(attributeName, attributeValue);
    }
  }
};
