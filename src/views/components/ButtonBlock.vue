<script setup lang="ts">
import { computed } from 'vue';
import type * as CSS from 'csstype';

type ButtonBlock = {
  backgroundColor?: CSS.Property.BackgroundColor;
  height?: CSS.Property.Height;
  icon?: boolean;
  width?: CSS.Property.Width;
};

const props = withDefaults(defineProps<ButtonBlock>(), {
  icon: false,
});

const classes = computed(() => ({
  'vc-button-block'      : true,
  'vc-button-block--icon': props.icon,
}));
</script>

<template>
  <button :class="classes" type="button" :style="{ width, height, backgroundColor }">
    <span>
      <slot />
    </span>
  </button>
</template>

<style lang="scss">
$root: '.vc-button-block';

.vc-button-block {
  @include text-body-lg;
  width: 56px;
  height: 56px;
  color: var(--color-white);
  background-color: var(--color-black);
  border: none;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  padding: 0 8px;
  transition-property: background-color, box-shadow;
  transition-duration: var(--transition-duration-very-fast);
  transition-timing-function: var(--transition-timing-function);

  span {
    line-height: 1px;
    transition: transform var(--transition-duration-very-fast) var(--transition-timing-function);
  }

  &:not(:disabled):active {
    box-shadow: 0 0 56px rgba(37, 52, 70, 0.28) inset;

    span {
      transform: scale(0.86);
    }
  }

  &--icon {
    padding-right: 0;
    padding-left: 0;

    compos-icon {
      max-width: 100%;
      min-height: 100%;
      fill: var(--color-white);
    }
  }

  &:disabled {
    color: white;
    background-color: var(--color-stone-2);
    border-color: transparent;
    cursor: not-allowed;
  }
}
</style>
