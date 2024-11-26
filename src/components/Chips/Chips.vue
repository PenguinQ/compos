<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  color?: 'red' | 'green' | 'blue';
  variant?: 'outline';
};

const props = defineProps<Props>();

const chipsClass = computed(() => ({
  'cp-chips': true,
  'cp-chips--outline': props.variant === 'outline',
  'cp-chips--red': props.color === 'red',
  'cp-chips--green': props.color === 'green',
  'cp-chips--blue': props.color === 'blue',
}));
</script>

<template>
  <div :class="chipsClass">
    <slot />
  </div>
</template>

<style lang="scss">
.cp-chips {
  $parent: &;

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
