<script setup lang="ts">
import { computed } from 'vue';
import type { ButtonHTMLAttributes } from 'vue';
import type * as CSS from 'csstype';

/**
 * @vue-ignore inline below to allow compiler ignore warning.
 * Reference: https://github.com/vuejs/core/issues/8286
 */
interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {
  /**
   * Set the color of the button.
   */
  color?: 'red' | 'green' | 'blue';
  /**
   * Set the button width to 100%.
   */
  full?: boolean;
  /**
   * Set the button to icon mode that has 50% border radius.
   */
  icon?: boolean;
  /**
   * Set the button padding.
   */
  padding?: CSS.Property.Padding;
  /**
   * Set the button variant.
   */
  variant?: 'outline' | 'text';
}

const props = withDefaults(defineProps<Props>(), {
  full: false,
  icon: false,
});

const buttonClass = computed(() => ({
  'cp-button'         : true,
  'cp-button--full'   : props.full,
  'cp-button--icon'   : props.icon,
  'cp-button--outline': props.variant === 'outline',
  'cp-button--text'   : props.variant === 'text',
  'cp-button--red'    : props.color === 'red',
  'cp-button--green'  : props.color === 'green',
  'cp-button--blue'   : props.color === 'blue',
}));
</script>

<template>
  <button :class="buttonClass" type="button" :style="{ padding }">
    <slot />
  </button>
</template>

<style lang="scss">
.cp-button {
  color: var(--color-white);
  font-size: 14px;
  line-height: 18px;
  font-weight: 600;
  background-color: var(--color-black);
  border: 1px solid var(--color-black);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  white-space: nowrap;
  transition: all 300ms cubic-bezier(0.63, 0.01, 0.29, 1);
  transform-origin: center;
  padding: 10px 12px;
  user-select: none;

  &--full {
    width: 100%;
  }

  &--red {
    color: var(--color-white);
    background-color: var(--color-red-3);
    border-color: var(--color-red-3);
  }

  &--green {
    color: var(--color-white);
    background-color: var(--color-green-3);
    border-color: var(--color-green-3);
  }

  &--blue {
    color: var(--color-white);
    background-color: var(--color-blue-3);
    border-color: var(--color-blue-3);
  }

  &--outline {
    color: var(--color-black);
    background-color: var(--color-white);
  }

  &--text {
    color: var(--color-black);
    background-color: transparent;
    border-color: transparent;
  }

  &--icon {
    border-radius: 50%;
    padding: 8px;
  }

  &--outline,
  &--text {
    &.cp-button--red {
      color: var(--color-red-4);
    }

    &.cp-button--green {
      color: var(--color-green-4);
    }

    &.cp-button--blue {
      color: var(--color-blue-4);
    }
  }

  &:not(:disabled):active {
    transform: scale(0.95);
  }

  &:disabled {
    color: white;
    background-color: var(--color-disabled-2);
    border-color: transparent;
    cursor: not-allowed;
  }
}

@include screen-md {
  .cp-button:not(.cp-button--icon) {
    padding: 13px 16px;
  }
}
</style>
