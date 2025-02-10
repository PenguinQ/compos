<script setup lang="ts">
import { computed } from 'vue';

type Chip = {
  /**
   * Set the Chip color.
   */
  color?: 'red' | 'green' | 'blue';
  /**
   * Set the Chip variant.
   */
  variant?: 'outline';
};

const props = defineProps<Chip>();

const classes = computed(() => ({
  'cp-chips'         : true,
  'cp-chips--outline': props.variant === 'outline',
  'cp-chips--red'    : props.color === 'red',
  'cp-chips--green'  : props.color === 'green',
  'cp-chips--blue'   : props.color === 'blue',
}));
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>

<style lang="scss">
.cp-chips {
  @include text-body-sm;
  color: var(--color-white);
  font-weight: 600;
  background-color: var(--color-black);
  border: 1px solid var(--color-black);
  border-radius: 12px;
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
    background-color: var(--color-white);

    &.cp-chips--red {
      color: var(--color-red-3);
    }

    &.cp-chips--green {
      color: var(--color-green-3);
    }

    &.cp-chips--blue {
      color: var(--color-blue-3);
    }
  }
}
</style>
