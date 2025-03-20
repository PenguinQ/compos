<script setup lang="ts">
import ToastItem from './ToastItem.vue';
import { useToast } from './hooks';

type Toast = {
  /**
   * Set where the Toast should be rendered.
   */
  to?: string;
};

withDefaults(defineProps<Toast>(), {
  to: 'body',
});

const { items, add, remove } = useToast();

defineExpose({ items, add });
</script>

<template>
  <template v-if="$slots.default">
    <Teleport :to="to">
      <div class="cp-toast-container">
        <slot />
      </div>
    </Teleport>
  </template>
  <template v-else-if="items.length">
    <Teleport :to="to">
      <div class="cp-toast-container">
        <ToastItem
          v-for="item in items"
          :key="`toast-item-${item.id}`"
          :duration="item.duration"
          :html="item.html"
          :message="item.message"
          :persist="item.persist"
          :persistOnHover="item.persistOnHover"
          :type="item.type"
          show
          @after-leave="remove"
        />
      </div>
    </Teleport>
  </template>
</template>

<style lang="scss">
.cp-toast-container {
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 12px;
  position: fixed;
  top: 16px;
  left: 50%;
  z-index: var(--z-max);
  transform: translateX(-50%);
  pointer-events: none;
  padding: 0 16px;
}
</style>
