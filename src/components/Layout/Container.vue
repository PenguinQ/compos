<script setup lang="ts">
import { computed } from 'vue';
import * as CSS from 'csstype';

type ContainerProps = {
  breakpoint?: 'md';
  fluid?: boolean;
  padding?: CSS.Property.Padding;
};

const props = defineProps<ContainerProps>();
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
    margin-right: auto;
    margin-left: auto;
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
