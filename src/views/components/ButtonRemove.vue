<script setup lang="ts">
import { computed } from 'vue';
import ComposIcon, { XLarge } from '@/components/Icons';

type ButtonRemove = {
  shadow?: boolean;
  size?: string | number;
};

const props = withDefaults(defineProps<ButtonRemove>(), {
  shadow: false,
});

const classes = computed(() => ({
  'button'                  : true,
  'button--icon'            : true,
  'vc-button-remove'        : true,
  'vc-button-remove--shadow': props.shadow,
}));
const size = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`;

  return props.size ? props.size : undefined;
});
</script>

<template>
  <button
    type="button"
    :class="classes"
    :style="{ width: size, height: size }"
  >
    <ComposIcon :icon="XLarge" size="100%" />
  </button>
</template>

<style lang="scss">
.vc-button-remove {
  width: 24px;
  height: 24px;
  background-color: var(--color-red-4);
  border-radius: 4px;
  cursor: pointer;
  transition-property: box-shadow, transform;
  transition-duration: var(--transition-duration-normal);
  transition-property: var(--transition-timing-function);
  padding: 4px;
  margin: 0;

  compos-icon {
    color: var(--color-white);
  }

  &--shadow {
    box-shadow:
      rgba(60, 64, 67, 0.3) 0 1px 2px 0,
      rgba(60, 64, 67, 0.15) 0 1px 3px 1px;
  }
}
</style>