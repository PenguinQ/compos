import { registerSW } from 'virtual:pwa-register';
import { offlineReady } from '@/utils/events';

export const registerPWA = () => {
  // const checkFontsCached = async () => {
  //   const allCaches = await caches.keys();

  //   console.log(allCaches);

  //   const gFontCache   = await caches.open('google-fonts-cache');
  //   const gStaticCache = await caches.open('gstatic-fonts-cache');
  //   const gFonts       = await gFontCache.keys();
  //   const gStatics     = await gStaticCache.keys();

  //   // Also try logging entire cache content
  //   const gContents = await Promise.all(gFonts.map(req => gFontCache.match(req)));
  //   const gStaticContents = await Promise.all(gStatics.map(req => gStaticCache.match(req)));

  //   console.log(gContents, gStaticContents);

  //   // console.log('Google Fonts cached:', gFonts.length);
  //   // console.log('Gstatic Fonts cached:', gStaticFonts.length);

  //   return gFonts.length > 0 && gStatics.length > 0;
  // };

  // const isOfflineReady = async () => {
  //   const isFontsCached = await checkFontsCached();

  //   if (isFontsCached) {
  //     console.log('Offline ready');
  //     window.dispatchEvent(offlineReady);
  //   } else {
  //     console.log('Not offline ready yet');
  //     setTimeout(isOfflineReady, 1000);
  //   }
  // };

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
