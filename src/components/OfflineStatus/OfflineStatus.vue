<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted } from 'vue';

const toast     = inject('ToastProvider');
const isOffline = ref(!navigator.onLine);

const handleOfflineReady = () => {
  // @ts-ignore
  toast.add({ message: 'App ready to work offline', noClose: true });
};

const updateOnlineStatus = () => {
  isOffline.value = !navigator.onLine;

  if (isOffline.value) {
    // @ts-ignore
    toast.add({ message: 'Offline mode', type: 'error', duration: 5000 });
  } else {
    // @ts-ignore
    toast.add({ message: `You're back online`, type: 'success', duration: 5000 });
  }
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  window.addEventListener('offline-ready', handleOfflineReady);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
  window.removeEventListener('offline-ready', handleOfflineReady);
});
</script>

<template></template>
