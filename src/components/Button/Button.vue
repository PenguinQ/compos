<script setup lang="ts">
import { ButtonHTMLAttributes } from 'vue';

/**
 * Vue only has limited Typescript support, that's why there's
 * @vue-ignore inline below to allow compiler ignore warning, see:
 *
 * https://github.com/vuejs/core/issues/8286
 */
interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {
  full?: boolean;
  type?: any;
  color?: string;
  variant?: 'outline' | 'text';
}

withDefaults(defineProps<Props>(), {
  full: false,
  type: 'button',
});
</script>

<template>
  <button
    class="cp-button"
    :type="type"
    :data-cp-color="color ? color : undefined"
    :data-cp-variant="variant ? variant : undefined"
    :data-cp-full="full ? true : undefined"
  >
    <slot></slot>
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

  &[data-cp-full] {
    width: 100%;
  }

  &:not(:disabled) {
    &[data-cp-color="red"] {
    color: var(--color-white);
    background-color: var(--color-red-3);
    border-color: var(--color-red-3);
  }

  &[data-cp-color="green"] {
    color: var(--color-white);
    background-color: var(--color-green-3);
    border-color: var(--color-green-3);
  }

  &[data-cp-color="blue"] {
    color: var(--color-white);
    background-color: var(--color-blue-3);
    border-color: var(--color-blue-3);
  }

  &[data-cp-variant="outline"] {
    color: var(--color-black);
    background-color: var(--color-white);

    &[data-cp-color] {
      background-color: var(--color-white);
    }

    &[data-cp-color="red"] {
      color: var(--color-red-3);
    }

    &[data-cp-color="green"] {
      color: var(--color-green-3);
    }

    &[data-cp-color="blue"] {
      color: var(--color-blue-3);
    }
  }

  &[data-cp-variant="text"] {
    color: var(--color-black);
    background-color: transparent;
    border-color: transparent;

    &[data-cp-color="red"] {
      color: var(--color-red-3);
    }

    &[data-cp-color="green"] {
      color: var(--color-green-3);
    }

    &[data-cp-color="blue"] {
      color: var(--color-blue-3);
    }
  }

    &:active {
      transform: scale(0.95);
    }
  }

  &:disabled {
    background-color: var(--color-disabled-2);
    border-color: transparent;
    cursor: not-allowed;
  }
}

@include screen-md {
  .cp-button {
    padding: 13px 16px;
  }
}
</style>
