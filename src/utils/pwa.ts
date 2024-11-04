import { registerSW } from 'virtual:pwa-register';

export function registerPWA() {
  // Add this to handle PWA updates
  const updateSW = registerSW({
    onNeedRefresh() {
      // You can replace this with a more sophisticated UI
      if (confirm('New content available. Reload?')) {
        updateSW();
      }
    },
    onOfflineReady() {
      alert('Offline Ready');
      console.log('App ready to work offline');
    }
  });
}
