<script setup lang="ts">
import type * as CSS from 'csstype';

type Separator = {
  /**
   * Set the width of the separator.
   */
  width?: CSS.Property.Width;
  /**
   * Set the height of the separator.
   */
  height?: CSS.Property.Height;
  /**
   * Set the color of the separator.
   */
  color?: CSS.Property.BackgroundColor;
  /**
   * Set the margin of the separator.
   */
  margin?: CSS.Property.Margin;
};

defineProps<Separator>();
</script>

<template>
  <hr class="cp-separator" :style="{ backgroundColor: color, width, height, margin }" />
</template>

<style lang="scss">
.cp-separator {
  height: 1px;
  background-color: var(--color-neutral-2);
  border: none;
  margin: 20px 0;
}
</style>
