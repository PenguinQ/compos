<script setup lang="ts">
import type * as CSS from 'csstype';

type CardHeader = {
  /**
   * Set the CSS padding value of the CardHeader.
   */
  padding?: CSS.Property.Padding;
};

defineProps<CardHeader>();
</script>

<template>
  <div class="cp-card__header" :style="{ padding }">
    <slot />
  </div>
</template>

<style lang="scss">
.cp-card__header {
  padding: 16px;
}
</style>
