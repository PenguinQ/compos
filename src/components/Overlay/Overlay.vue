<script lang="ts">
export default { inheritAttrs: false };
</script>
<script setup lang="ts">
import { Teleport, Transition, onBeforeMount } from 'vue';
import { useOverlayContainer } from '@hooks';
import type * as CSS from 'csstype';

interface Props {
  duration?: number;
  modelValue?: boolean;
  overflow?: boolean;
  padding?: CSS.Property.Padding;
}

withDefaults(defineProps<Props>(), {
  duration: 300,
  modelValue: false,
  overflow: false,
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

const { overlayContainer, createOverlayContainer } = useOverlayContainer();

onBeforeMount(() => {
  createOverlayContainer();
});

const handleEnter = () => {
  document.body.style.overflow = 'hidden';
  emits('enter');
};

const handleLeave = () => {
  document.body.style.overflow = '';
  emits('leave');
};
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
      <div
        v-if="modelValue"
        v-bind="$attrs"
        class="cp-overlay"
        :data-cp-overflow="overflow ? overflow : undefined"
      >
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
.cp-overlay {
  pointer-events: auto;
  position: fixed;
  inset: 0;
  overflow-y: auto;
  z-index: 100;

  &__wrapper {
    width: 100%;
    height: 100%;
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
    // max-width: 100%;
    // max-height: 100%;

    > * {
      position: relative;
    }
  }

  &[data-cp-overflow] .cp-overlay__wrapper {
    min-height: 100%;
    height: auto;
  }

  &.v-enter-from .cp-overlay__backdrop,
  &.v-leave-to .cp-overlay__backdrop {
    opacity: 0;
  }
}
</style>
