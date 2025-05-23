<script setup lang="ts">
import { computed, Teleport, Transition, onUnmounted } from 'vue';
import type * as CSS from 'csstype';

import { useOverlayContainer } from '@/hooks';

type Overlay = {
  duration?: number;
  modelValue?: boolean;
  fullscreen?: boolean;
  padding?: CSS.Property.Padding;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Overlay>(), {
  duration  : 300,
  modelValue: false,
  fullscreen: false,
});

const emits = defineEmits([
  'on-click-backdrop',
  'before-enter',
  'enter',
  'after-enter',
  'enter-cancelled',
  'before-leave',
  'leave',
  'after-leave',
  'leave-cancelled',
]);

const { overlayContainer } = useOverlayContainer();
const classes = computed(() => ({
  'cp-overlay'            : true,
  'cp-overlay--fullscreen': props.fullscreen,
}));

const handleEnter = () => {
  document.body.style.overflow = 'hidden';
  emits('enter');
};

const handleLeave = () => {
  document.body.style.overflow = '';
  emits('leave');
};

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport :to="overlayContainer ? overlayContainer : 'body'">
    <Transition
      :duration="duration"
      @before-enter="$emit('before-enter')"
      @enter="handleEnter"
      @after-enter="$emit('after-enter')"
      @enter-cancelled="$emit('enter-cancelled')"
      @before-leave="$emit('before-leave')"
      @leave="handleLeave"
      @after-leave="$emit('after-leave')"
      @leave-cancelled="$emit('leave-cancelled')"
    >
      <div v-if="modelValue" v-bind="$attrs" :class="classes">
        <div class="cp-overlay__wrapper" :style="{ padding }">
          <div class="cp-overlay__backdrop" @click="$emit('on-click-backdrop')" />
          <div class="cp-overlay__content">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss">
.cp-overlay-container {
  contain: layout;
  display: contents;
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
}

.cp-overlay {
  pointer-events: auto;
  position: fixed;
  inset: 0;
  overflow-y: auto;
  z-index: var(--z-50);

  &__wrapper {
    width: 100%;
    min-height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__backdrop {
    background-color: rgba(0, 0, 0, 0.2);
    position: absolute;
    inset: 0;
    pointer-events: auto;
    transition: opacity 300ms cubic-bezier(0.63, 0.01, 0.29, 1);
  }

  &__content {
    display: contents;
    contain: layout;
    pointer-events: auto;
    position: relative;

    > * {
      position: relative;
    }
  }

  &--fullscreen {
    overflow: hidden;

    .cp-overlay__wrapper {
      height: 100%;
    }
  }

  &.v-enter-from .cp-overlay__backdrop,
  &.v-leave-to .cp-overlay__backdrop {
    opacity: 0;
  }
}
</style>
