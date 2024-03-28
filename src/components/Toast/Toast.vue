<script setup lang="ts">
import { ref } from 'vue';

import ToastItem from './ToastItem.vue';
import type { ToastItemProps } from './ToastItem.vue'

const toasts = ref<ToastItemProps[]>([]);

const add = ({ message, type, props }: ToastItemProps) => {
  const toast = { message, type, props, timeout: undefined };

  toasts.value.push(toast);

  toast.timeout = setTimeout(() => {
    console.log('remove');
    remove(toast);
  }, 1000);
};

const remove = (toast: any) => {
  const index = toasts.value.indexOf(toast)

  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

const stopClosing = (toast: any) => {
  console.log('Stop');

  clearTimeout(toast.timer);
};

const resumeClosing = (toast: any) => {
  console.log('Resume');

  toast.timer = setTimeout(() => {
    remove(toast);
  }, 1000)
};

defineExpose({ add });
</script>

<template>
  <div v-if="toasts.length" class="cp-toast-container">
    <slot />
    <ToastItem
      :key="index"
      v-for="(toast, index) in toasts"
      v-bind="toast.props"
      :message="toast.message"
      :type="toast.type"
      show
      @mouseenter="stopClosing(toast)"
      @mouseleave="resumeClosing(toast)"
    />
  </div>
</template>

<style lang="scss"></style>
