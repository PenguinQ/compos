<script lang="ts">
export default { name: 'TickerItem' };
</script>
<script setup lang="ts">
import { computed } from 'vue';

export type TickerItemProps = {
  title?: string;
  description?: string;
  type?: 'error' | 'info' | 'warning';
};

const props = defineProps<TickerItemProps>();

const tickerClass = computed(() => ({
  'cp-ticker-item': true,
  'cp-ticker-item--error': props.type === 'error',
  'cp-ticker-item--info': props.type === 'info',
  'cp-ticker-item--warning': props.type === 'warning',
}));
</script>

<template>
  <div :class="tickerClass">
    <div class="cp-ticker-item__title">
      <slot name="title" />
      <template v-if="!$slots.title && title">{{ title }}</template>
    </div>
    <div class="cp-ticker-item__description">
      <slot name="description" />
      <template v-if="!$slots.description && description">{{ description }}</template>
    </div>
  </div>
</template>

<style lang="scss">
.cp-ticker-item {
  flex: 0 0 100%;
  padding: 16px;
}
</style>
