import { registerSW } from 'virtual:pwa-register';

export const registerPWA = () => {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('New content available. Reload?')) {
        updateSW();
      }
    },
    onOfflineReady() {
      console.log('Ready to work offline.');
    },
  });
};
