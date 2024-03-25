<script setup lang="ts">
import type * as CSS from 'csstype';

type Props = {
  padding?: CSS.Property.Padding;
};

defineProps<Props>();
</script>

<template>
  <div class="cp-card__body" :style="{ padding }">
    <slot />
  </div>
</template>

<style lang="scss">
.cp-card__body {
  padding: 16px;

  .cp-card__header + & {
    padding: 0 16px 16px;
  }
}
</style>
