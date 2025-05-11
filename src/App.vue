<script setup lang="ts">
import { onMounted, onUnmounted, watchEffect } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { Analytics } from '@vercel/analytics/vue';

import { recreateDB } from '@/database';
import { backupStore } from '@/stores';

// Common Components
import { OfflineStatus, ToastProvider } from '@/components';

// View Components
import WarningFirefox from '@/views/components/WarningFirefox.vue';

const route = useRoute();

const checkFromBlob = () => {
  if (document.visibilityState === 'visible' && backupStore.get()) recreateDB();
};

onMounted(() => {
  backupStore.clear();

  document.addEventListener('visibilitychange', checkFromBlob);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', checkFromBlob);
});

watchEffect(() => {
  const defaultTitle = 'ComPOS';

  document.title = (route.meta.title as string) || defaultTitle;
});
</script>

<template>
  <ToastProvider>
    <Analytics />
    <OfflineStatus />
    <WarningFirefox />
    <RouterView />
    <RouterView name="navigation" />
  </ToastProvider>
</template>
