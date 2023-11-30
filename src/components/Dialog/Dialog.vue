<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, watch } from 'vue';
import type * as CSS from 'csstype';
import Overlay from '@components/Overlay'

import { debounce } from '@helpers';

interface Props {
  width?: CSS.Property.Width;
  fullscreen?: boolean;
  maxWidth?: CSS.Property.MaxWidth;
  minWidth?: CSS.Property.MinWidth;
  modelValue?: boolean;
  persistent?: boolean;
  overflow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  fullscreen: false,
  modelValue: false,
  persistent: false,
  overflow: false,
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
    :overflow="overflow"
    :modelValue="modelValue"
    @onClickBackdrop="!persistent && closeDialog()"
    @before-enter="$emit('before-enter')"
    @enter="$emit('enter')"
    @after-enter="$emit('after-enter')"
    @enter-cancelled="$emit('enter-cancelled')"
    @before-leave="$emit('before-leave')"
    @leave="$emit('leave')"
    @after-leave="$emit('after-leave')"
    @leave-cancelled="$emit('leave-cancelled')"
  >
    <div
      class="cp-dialog"
      v-if="modelValue"
      :style="{ maxWidth, minWidth, width }"
    >
      <slot />
    </div>
  </Overlay>
</template>

<style lang="scss">
.cp-dialog {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  transition: all 300ms ease;

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
