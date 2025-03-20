<script setup lang="ts">
import { provide, inject } from 'vue';

import Toast from './Toast.vue';
import ToastItem from './ToastItem.vue';

import { useToast } from './hooks';
import type { ToastReturn } from './hooks/useToast';

type ToastProvider = {
  /**
   * Set where the Toast should be rendered.
   */
  to?: string;
};

withDefaults(defineProps<ToastProvider>(), {
  to: 'body',
});

const plugin = inject<ToastReturn>('ToastProvider');

const { items, add, remove } = plugin || useToast();

if (!plugin) provide('ToastProvider', { items, add });
</script>

<template>
  <slot />
  <Toast v-if="items.length" :to="to">
    <ToastItem
      v-for="item in items"
      :key="`toast-provider-item-${item.id}`"
      :duration="item.duration"
      :html="item.html"
      :message="`${item.id} - ${item.message}`"
      :persist="item.persist"
      :persistOnHover="item.persistOnHover"
      :noClose="item.noClose"
      :type="item.type"
      show
      @after-leave="remove"
    />
  </Toast>
</template>
