<script setup lang="ts">
import { ref, Transition, onMounted, watch } from 'vue';

import ComposIcon, { X } from '@/components/Icons';

export type ToastItemProps = {
  /**
   * Set the text message to be shown.
   */
  message: string;
  /**
   * Set the duration for the toast before it's closing.
   */
  duration?: number;
  /**
   * Render message as raw html, allowing inline style or html tag to be rendered.
   */
  html?: boolean;
  /**
   * Set show state using v-model two way data binding.
   */
  modelValue?: boolean;
  /**
   * Stop auto closing of the toast.
   */
  persist?: boolean;
  /**
   * Stop toast from auto closing when hovering the text.
   */
  persistOnHover?: boolean;
  /**
   * Toggle the toast to show.
   */
  show?: boolean;
  /**
   * Set the display for the toast.
   */
  type?: 'error' | 'success';
};

const props = withDefaults(defineProps<ToastItemProps>(), {
  duration: 5000,
  html: false,
  persist: false,
  persistOnHover: false,
});

const emit = defineEmits(['update:modelValue', 'enter', 'after-enter', 'leave', 'after-leave']);

const display = ref(props.modelValue ? props.modelValue : props.show);

let toast_timeout: ReturnType<typeof setTimeout>;

const handleClose = () => {
  if (props.modelValue) {
    emit('update:modelValue', false);
  } else {
    display.value = false;
  }
};

const handleMouseEnter = () => {
  if (!props.persist || !props.persistOnHover) clearTimeout(toast_timeout);;
};

const handleMouseLeave = () => {
  clearTimeout(toast_timeout);

  if (!props.persist || !props.persistOnHover) {
    if (props.modelValue) {
      toast_timeout = setTimeout(() => emit('update:modelValue', false), props.duration);
    } else {
      toast_timeout = setTimeout(() => (display.value = false), props.duration);
    }
  }
};

onMounted(() => {
  clearTimeout(toast_timeout);

  if (!props.persist) {
    if (props.modelValue) {
      toast_timeout = setTimeout(() => emit('update:modelValue', false), props.duration);
    } else {
      toast_timeout = setTimeout(() => (display.value = false), props.duration);
    }
  }
});

watch(
  () => props.modelValue,
  (modelValue) => {
    if (modelValue) {
      clearTimeout(toast_timeout);

      if (!props.persist) {
        toast_timeout = setTimeout(() => emit('update:modelValue', false), props.duration);
      }
    }

    display.value = modelValue ? true : false;
  },
);

watch(
  () => props.show,
  (show) => {
    if (show) {
      clearTimeout(toast_timeout);

      if (!props.persist) {
        toast_timeout = setTimeout(() => (display.value = false), props.duration);
      }
    }

    display.value = show ? true : false;
  },
);
</script>

<template>
  <Transition
    appear
    :duration="280"
    @enter="$emit('enter')"
    @after-enter="$emit('after-enter')"
    @leave="$emit('leave')"
    @after-leave="$emit('after-leave')"
  >
    <div
      v-if="display"
      class="cp-toast"
      :data-cp-success="props.type === 'success' ? true : undefined"
      :data-cp-error="props.type === 'error' ? true : undefined"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <template v-if="$slots.default">
        <div class="cp-toast__content">
          <slot />
        </div>
      </template>
      <template v-else>
        <div v-if="html" class="cp-toast__content" v-html="message" />
        <div v-else class="cp-toast__content">{{ message }}</div>
      </template>
      <button class="cp-toast__close" @click="handleClose">
        <ComposIcon :icon="X" :size="24" color="var(--color-white)" />
      </button>
    </div>
  </Transition>
</template>

<style lang="scss">
.cp-toast {
  max-width: 480px;
  color: var(--color-white);
  background-color: #0d1317;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: var(--z-max);
  transition-property: all;
  transition-duration: var(--transition-duration-normal);
  transition-timing-function: var(--transition-function);
  pointer-events: all;

  &__content {
    flex: 1 1 auto;
  }

  &__close {
    color: var(--color-white);
    background-color: transparent;
    border: none;
    flex-shrink: 0;
    align-self: flex-start;
    cursor: pointer;
    padding: 0;
  }

  &[data-cp-success] {
    background-color: var(--color-green-4);
  }

  &[data-cp-error] {
    background-color: var(--color-red-4);
  }

  &.v-enter-from {
    transform: translate3d(0, -12px, 0);
    opacity: 0;
  }

  &.v-leave-to {
    opacity: 0;
  }
}
</style>
