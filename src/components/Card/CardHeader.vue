<script setup lang="ts">
import type * as CSS from 'csstype';

type Props = {
  padding?: CSS.Property.Padding;
};

defineProps<Props>();
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
