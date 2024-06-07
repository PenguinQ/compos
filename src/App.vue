<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ToastProvider } from '@components/Toast';
</script>

<template>
  <ToastProvider>
    <RouterView />
    <RouterView name="navigation" />
  </ToastProvider>
</template>
