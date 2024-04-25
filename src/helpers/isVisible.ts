export default (element: HTMLElement, container: HTMLElement): boolean | undefined => {
  if (!element) return;

  const element_rect = element.getBoundingClientRect();
  const container_rect = container.getBoundingClientRect();

  return (
    element_rect.top >= container_rect.top &&
    element_rect.left >= container_rect.left &&
    element_rect.bottom <= container_rect.bottom &&
    element_rect.right <= container_rect.right
  );
};
