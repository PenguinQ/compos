<script setup lang="ts">
import type * as CSS from 'csstype';

type CardBody = {
  /**
   * Set the CSS padding value of the CardBody.
   */
  padding?: CSS.Property.Padding;
};

defineProps<CardBody>();
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
