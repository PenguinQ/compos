<script setup lang="ts">
import { computed, Fragment } from 'vue';
import type { Slot } from 'vue';

type TabPanels = {
  /**
   * Set the active TabPanel using v-model two way data binding.
   */
  modelValue: string | number;
};

type TabPanelsSlots = {
  default?: Slot;
};

defineOptions({ name: 'TabPanels' });

const props = defineProps<TabPanels>();
const slots = defineSlots<TabPanelsSlots>();

const active = computed(() => props.modelValue);
const panels = computed(() => {
  if (!slots.default) return [];

  return slots.default().map(vnode => {
    if (vnode.type === Fragment) return vnode.children;

    return vnode;
  }).flat();
});
</script>

<template>
  <div v-if="$slots.default" class="cp-tab-panels">
    <component
      v-for="(panel, index) in panels"
      :is="panel"
      :active="active === index"
      :data-cp-active="active === index ? true : undefined"
    />
  </div>
</template>
