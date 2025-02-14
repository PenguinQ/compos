export default (e: HTMLElement): Element[] => {
  const parent = e.parentElement;

  if (parent) return [...parent.children].filter(child => child !== e && child.tagName === e.tagName);

  return [];
};
