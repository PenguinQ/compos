<script setup lang="ts">
import { watchEffect } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { OfflineStatus, ToastProvider } from '@/components';

const route = useRoute();

watchEffect(() => {
  const defaultTitle = 'ComPOS';

  document.title = (route.meta.title as string) || defaultTitle;
});
</script>

<template>
  <ToastProvider>
    <OfflineStatus />
    <RouterView />
    <RouterView name="navigation" />
  </ToastProvider>
</template>
