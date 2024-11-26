<script setup lang="ts">
import { computed } from 'vue';
import * as CSS from 'csstype';

type Container = {
  breakpoint?: 'md';
  fluid?: boolean;
  padding?: CSS.Property.Padding;
};

const props = defineProps<Container>();
const containerClass = computed(() => ({
  'cp-container': true,
  'cp-container--fluid': props.fluid,
}));
</script>

<template>
  <div
    :class="containerClass"
    :data-cp-breakpoint="breakpoint ? breakpoint : undefined"
    :style="{ padding }"
  >
    <slot />
  </div>
</template>

<style lang="scss">
.cp-container {
  &,
  &--fluid {
    width: 100%;
    padding-top: var(--padding-top, 0);
    padding-bottom: var(--padding-bottom, 0);
    padding-inline-start: var(--padding-start, 0);
    padding-inline-end: var(--padding-end, 0);
    margin-inline-start: var(--margin-start, auto);
    margin-inline-end: var(--margin-end, auto);
  }
}

@include screen-md {
  .cp-container {
    &:not([data-cp-breakpoint]):not([class*="cp-container--fluid"]) {
      max-width: 1320px;
    }

    &[data-cp-breakpoint="md"] {
      max-width: 1320px;
    }
  }
}
</style>
