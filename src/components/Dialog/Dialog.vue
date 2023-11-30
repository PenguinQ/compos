<script setup lang="ts">
import { onUnmounted, watch } from 'vue';
import type * as CSS from 'csstype';

import Text from '@components/Text'
import Overlay from '@components/Overlay'
import { XLarge } from '@icons';

import { debounce } from '@helpers';

interface Props {
  width?: CSS.Property.Width;
  fullscreen?: boolean;
  maxWidth?: CSS.Property.MaxWidth;
  minWidth?: CSS.Property.MinWidth;
  modelValue?: boolean;
  noClose?: boolean;
  overflow?: boolean;
  persistent?: boolean;
  title?: string;
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

const handleResize = debounce(() => {
  console.log('Resize');
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

watch(
  () => props.modelValue,
  (modelValue) => {
    if (modelValue) {
      window.addEventListener('resize', handleResize);
    } else {
      window.removeEventListener('resize', handleResize);
    }
  },
);

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
    <div
      class="cp-dialog"
      v-if="modelValue"
      :style="{ maxWidth, minWidth, width }"
    >
      <button
        v-if="!noClose"
        class="cp-dialog__close"
        type="button"
        aria-label="Close"
        @click="closeDialog"
      >
        <XLarge size="24" />
      </button>
      <div v-if="title || $slots.header" class="cp-dialog-header">
        <Text v-if="title && !$slots.header" class="cp-dialog-header__title" heading="3">
          {{ title }}
        </Text>
        <slot v-if="$slots.header" name="header"></slot>
      </div>
      <div class="cp-dialog-body">
        <slot />
      </div>
      <slot v-if="$slots.footer" name="footer"></slot>
    </div>
  </Overlay>
</template>

<style lang="scss">
.cp-dialog {
  min-width: calc(320px - 32px);
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  transition: all 300ms ease;
  position: relative;

  &__close {
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: all 300ms cubic-bezier(0.63, 0.01, 0.29, 1);
    transform-origin: center;
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 2px;

    &:active {
      transform: scale(0.90);
    }
  }

  &-header {
    position: relative;
    margin-bottom: 16px;

    &__title {
      line-height: 28px;
      padding-right: 28px;
      margin: 0;
    }
  }

  &-body {
    &:empty {
      min-height: 28px;
    }
  }

  .v-enter-from &,
  .v-leave-to & {
    opacity: 0;
    transform: translateY(8px);
  }
}

@include screen-md {
  .cp-dialog {

  }
}
</style>
