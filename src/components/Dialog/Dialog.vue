<script setup lang="ts">
import type * as CSS from 'csstype';

import Text from '@components/Text'
import Overlay from '@components/Overlay'
import { IconX } from '@icons';

interface Props {
  fullscreen?: boolean;
  maxWidth?: CSS.Property.MaxWidth;
  minWidth?: CSS.Property.MinWidth;
  modelValue?: boolean;
  noClose?: boolean;
  overflow?: boolean;
  persistent?: boolean;
  title?: string;
  width?: CSS.Property.Width;
}

const props = withDefaults(defineProps<Props>(), {
  fullscreen: false,
  modelValue: false,
  noClose: false,
  overflow: false,
  persistent: false,
});

const emits = defineEmits([
  'update:modelValue',
  'before-enter',
  'enter',
  'after-enter',
  'enter-cancelled',
  'before-leave',
  'leave',
  'after-leave',
  'leave-cancelled',
]);

const closeDialog = () => {
  if (props.modelValue) emits('update:modelValue', false);
};
</script>

<template>
  <Overlay
    class="cp-overlay--dialog"
    role="dialog"
    aria-modal="true"
    padding="16px"
    overflow
    :modelValue="modelValue"
    @before-enter="$emit('before-enter')"
    @enter="$emit('enter')"
    @after-enter="$emit('after-enter')"
    @enter-cancelled="$emit('enter-cancelled')"
    @before-leave="$emit('before-leave')"
    @leave="$emit('leave')"
    @after-leave="$emit('after-leave')"
    @leave-cancelled="$emit('leave-cancelled')"
    @onClickBackdrop="!persistent && closeDialog()"
  >
    <div class="cp-dialog" v-if="modelValue" :style="{ maxWidth, minWidth, width }">
      <button
        v-if="!noClose"
        class="cp-dialog__close"
        type="button"
        aria-label="Close"
        @click="closeDialog"
      >
        <IconX size="24" />
      </button>
      <div v-if="title || $slots.header" class="cp-dialog-header">
        <Text v-if="title && !$slots.header" class="cp-dialog__title" heading="3" textAlign="center">
          {{ title }}
        </Text>
        <slot v-if="$slots.header" name="header" />
      </div>
      <div class="cp-dialog-body">
        <slot />
      </div>
      <div v-if="$slots.footer" class="cp-dialog-footer">
        <slot name="footer" />
      </div>
    </div>
  </Overlay>
</template>

<style lang="scss">
.cp-dialog {
  min-width: calc(320px - 32px);
  background-color: white;
  border-radius: 8px;
  box-shadow: rgba(50, 50, 93, 0.25) 0 2px 5px -1px, rgba(0, 0, 0, 0.3) 0 1px 3px -1px;
  position: relative;
  transition: all 300ms ease;

  &__close {
    background-color: var(--color-black);
    border: 1px solid var(--color-black);
    border-radius: 8px;
    box-shadow: rgba(50, 50, 93, 0.25) 0 2px 5px -1px, rgba(0, 0, 0, 0.3) 0 1px 3px -1px;
    cursor: pointer;
    transition: all 300ms cubic-bezier(0.63, 0.01, 0.29, 1);
    transform-origin: center;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    transform: translate(50%, -50%);
    padding: 0;

    .cp-icon {
      fill: var(--color-white);
    }

    &:active {
      transform: translate(50%, -50%) scale(0.90);
    }
  }

  &-header {
    position: relative;
  }

  &__title {
    line-height: 28px;
    padding: 16px 16px 0;
    margin: 0;
  }

  &-body {
    padding: 16px;
  }

  .v-enter-from &,
  .v-leave-to & {
    opacity: 0;
    transform: translateY(8px);
  }
}

@include screen-md {
  .cp-dialog {
    &__title {
      font-size: var(--text-heading-4-size);
      line-height: var(--text-heading-4-height);
    }
  }
}
</style>
