<script setup lang="ts">
import { computed } from 'vue';
import * as CSS from 'csstype';

type ButtonBlockProps = {
  backgroundColor?: CSS.Property.BackgroundColor;
  height?: CSS.Property.Height;
  icon?: boolean;
  width?: CSS.Property.Width;
};

const props = withDefaults(defineProps<ButtonBlockProps>(), {
  icon: false,
});

const button_class = computed(() => ({
  'vc-button-block': true,
  'vc-button-block--icon': props.icon,
}));
</script>

<template>
  <button :class="button_class" type="button" :style="{ width, height, backgroundColor }">
    <span>
      <slot />
    </span>
  </button>
</template>

<style lang="scss">
$root: '.vc-button-block';

.vc-button-block {
  width: 56px;
  height: 56px;
  color: var(--color-white);
  font-size: var(--text-body-large-size);
  line-height: var(--text-body-large-height);
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
    background-color: var(--color-disabled-2);
    border-color: transparent;
    cursor: not-allowed;
  }
}
</style>
