<script setup lang="ts">
interface Props {
  fluid?: boolean;
  breakpoint?: 'md';
}

defineProps<Props>();
</script>

<template>
  <div
    class="cp-container"
    :data-cp-fluid="fluid ? fluid : undefined"
    :data-cp-breakpoint="breakpoint ? breakpoint : undefined"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss">
.cp-container {
  &,
  &[data-cp-fluid] {
    width: 100%;
    margin-right: auto;
    margin-left: auto;
  }
}

@include screen-md {
  .cp-container {
    &:not([data-cp-breakpoint]):not([data-cp-fluid]) {
      max-width: 1320px;
    }

    &[data-cp-breakpoint="md"] {
      max-width: 1320px;
    }
  }
}
</style>
