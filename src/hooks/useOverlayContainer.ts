import { ref, onBeforeMount, onBeforeUnmount } from 'vue';
import { addClass } from '@helpers';

const useOverlayContainer = () => {
  const container = ref<HTMLDivElement>();
  const overlayContainer = '.cp-overlay-container';
  const hasOverlayContainer = document?.querySelector(overlayContainer);

  const createOverlayContainer = () => {
    container.value = document.createElement('div');
    addClass('cp-overlay-container', container.value);
    document.body.appendChild(container.value);
  };

  onBeforeMount(() => {
    if (!hasOverlayContainer) createOverlayContainer();
  });

  onBeforeUnmount(() => {
    if (container.value) document.body.removeChild(container.value);
  });

  return {
    overlayContainer,
    hasOverlayContainer,
    createOverlayContainer,
  };
};

export default useOverlayContainer;
