import { registerSW } from 'virtual:pwa-register';

export const registerPWA = () => {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('New version available. Update now?')) {
        updateSW?.().then(() => {
          window.location.reload();
        });
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline.');
    },
  });
};
