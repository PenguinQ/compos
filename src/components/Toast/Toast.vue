<script setup lang="ts">
import { ref, watch } from 'vue';

import ToastItem from './ToastItem.vue';
import type { ToastItemProps } from './ToastItem.vue'

type ToastProps = {
  // items?: any;
  counter?: number;
};

const props = withDefaults(defineProps<ToastProps>(), {
  // items: [],
});

const emit = defineEmits(['after-leave']);

const items = ref<ToastItemProps[]>([]);
const counter = ref(0);

const add = (props: ToastItemProps) => {
  items.value.push(props);
};

const remove = () => {
  counter.value += 1;

  if (items.value.length === counter.value) {
    items.value = [];
    counter.value = 0;
  }
};

defineExpose({ items, add });
</script>

<template>
  <template v-if="$slots.default">
    <Teleport to="body">
      <div class="cp-toast-container">
        <slot />
      </div>
    </Teleport>
  </template>
  <template v-else-if="items.length">
    <Teleport to="body">
      <div class="cp-toast-container">
        <ToastItem
          v-for="(item, index) in items"
          :key="index"
          :duration="item.duration"
          :message="item.message"
          :type="item.type"
          :persist="item.persist"
          show
          @after-leave="remove"
        />
      </div>
    </Teleport>
  </template>
</template>

<style lang="scss">
.cp-toast-container {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 12px;
  position: fixed;
  top: 16px;
  left: 50%;
  z-index: 60;
  transform: translateX(-50%);
  pointer-events: none;
}
</style>
