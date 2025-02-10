<script setup lang="ts">
import { computed } from 'vue';

type Label = {
  /**
   * Set the Label color.
   */
  color?: 'red' | 'green' | 'blue';
  /**
   * Set the Chip variant.
   */
  variant?: 'outline';
};

const props = defineProps<Label>();

const classes = computed(() => ({
  'cp-label'         : true,
  'cp-label--outline': props.variant === 'outline',
  'cp-label--red'    : props.color === 'red',
  'cp-label--green'  : props.color === 'green',
  'cp-label--blue'   : props.color === 'blue',
}));
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>

<style lang="scss">
.cp-label {
  $parent: &;

  @include text-body-sm;
  color: var(--color-white);
  font-weight: 600;
  background-color: var(--color-black);
  border: 1px solid var(--color-black);
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 4px 8px;

  &--red {
    color: white;
    background-color: var(--color-red-3);
    border-color: var(--color-red-3);
  }

  &--green {
    color: white;
    background-color: var(--color-green-3);
    border-color: var(--color-green-3);
  }

  &--blue {
    color: white;
    background-color: var(--color-blue-3);
    border-color: var(--color-blue-3);
  }

  &--outline {
    color: var(--color-black);
    background-color: var(--color-white);

    &#{$parent}--red {
      color: var(--color-red-3);
    }

    &#{$parent}--green {
      color: var(--color-green-3);
    }

    &#{$parent}--blue {
      color: var(--color-blue-3);
    }
  }
}
</style>
