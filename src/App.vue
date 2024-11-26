<script setup lang="ts">
import { watchEffect } from 'vue';
import { RouterView, useRoute } from 'vue-router';

// Common Components
import { OfflineStatus, ToastProvider } from '@/components';

// View Components
import WarningFirefox from '@/views/components/WarningFirefox.vue';

const route = useRoute();

watchEffect(() => {
  const defaultTitle = 'ComPOS';

  document.title = (route.meta.title as string) || defaultTitle;
});
</script>

<template>
  <ToastProvider>
    <OfflineStatus />
    <WarningFirefox />
    <RouterView />
    <RouterView name="navigation" />
  </ToastProvider>
</template>
