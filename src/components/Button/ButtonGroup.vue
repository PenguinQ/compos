<script setup lang="ts">
import { reactive } from 'vue';

type Props = {
  full?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  full: false,
});

const groupClass = reactive({
  'cp-button-group': true,
  'cp-button-group--full': props.full,
});
</script>

<template>
  <div :class="groupClass">
    <slot />
  </div>
</template>

<style lang="scss">
.cp-button-group {
  display: inline-grid;
  grid-auto-flow: column;

  &--full {
    width: 100%;
    grid-auto-columns: 1fr;
  }

  > .cp-button {
    margin-left: -1px;
  }

  > .cp-button {
    border-radius: 0;

    &:first-child {
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
      margin-left: 0;
    }

    &:last-child {
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;

      &:not(:last-child) {
        border-radius: 0;
      }
    }

    &:active {
      transform: none;
    }
  }
}
</style>
