import { registerSW } from 'virtual:pwa-register';

import { offlineReady } from '@/utils/events';

export const registerPWA = () => {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('New version available. Update now?')) {
        updateSW?.().then(() => {
          window.location.reload();
        }).catch((error) => {
          console.error('[SW] Failed to update service worker:', error);
        });
      }
    },
    onOfflineReady() {
      console.log('[SW] App ready to work offline');

      window.dispatchEvent(offlineReady);
    },
    onRegisteredSW() {
      console.log('[SW] Service worker registered');
    },
    onRegisterError(error) {
      console.error('[SW] Service worker registration failed:', error);
    },
  });
};
