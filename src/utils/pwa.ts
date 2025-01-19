import { registerSW } from 'virtual:pwa-register';
import { offlineReady } from '@/utils/events';

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
      window.dispatchEvent(offlineReady);
    },
  });
};
