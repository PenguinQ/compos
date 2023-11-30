import { addClass } from '@helpers';

const useOverlayContainer = () => {
  const overlayContainer = '.cp-overlay-container';
  const hasOverlayContainer = document?.querySelector(overlayContainer);

  const createOverlayContainer = () => {
    if (!hasOverlayContainer) {
      const container = document.createElement('div');
      addClass('cp-overlay-container', container);

      document.body.appendChild(container);
    }
  };

  return {
    overlayContainer,
    hasOverlayContainer,
    createOverlayContainer,
  };
};

export default useOverlayContainer;
