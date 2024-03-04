<script setup lang="ts">
import { reactive } from 'vue';

interface Props {
  fluid?: boolean;
  breakpoint?: 'md';
}

const props = defineProps<Props>();
const containerClass = reactive({
  'cp-container': true,
  'cp-container--fluid': props.fluid,
});
</script>

<template>
  <div :class="containerClass" :data-cp-breakpoint="breakpoint ? breakpoint : undefined">
    <slot></slot>
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
