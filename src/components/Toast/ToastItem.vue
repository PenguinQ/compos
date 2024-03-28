<script setup lang="ts">
import { ref, Transition, onMounted, watch } from 'vue';

export type ToastItemProps = {
  message: string;
  type?: 'error' | 'success';
  duration?: number;
  props?: object;
  modelValue?: boolean;

  // Tests
  show?: boolean;
  timer?: any;
};

const item_props = withDefaults(defineProps<ToastItemProps>(), {
  duration: 5000,
});

const emit = defineEmits([
  'enter',
  'after-enter',
  'leave',
  'after-leave',
]);

const display = ref(item_props.modelValue ? item_props.modelValue : item_props.show);

let item_timeout: ReturnType<typeof setTimeout>;

onMounted(() => {
  clearTimeout(item_timeout);

  console.log('Mounted');
});
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
      v-bind="props"
      :data-cp-success="item_props.type === 'success' ? true : undefined"
      :data-cp-error="item_props.type === 'error' ? true : undefined"
    >
      <template v-if="$slots.default"><slot /></template>
      <template v-else>{{ message }}</template>
    </div>
  </Transition>
</template>

<style lang="scss">
.cp-toast {
  color: var(--color-white);
  background-color: var(--color-black);
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  z-index: 60;
  transition-property: all;
  transition-duration: var(--transition-duration-normal);
  transition-timing-function: var(--transition-function);
  pointer-events: all;

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
