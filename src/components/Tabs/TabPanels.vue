<script setup lang="ts">
import { computed, ref, Fragment } from 'vue';
import type { Slot, VNode } from 'vue';

import { createLoopKey, instanceCounters } from '@/helpers';

type TabPanels = {
  /**
   * Set the TabPanels id.
   */
  id?: string;
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

const instance = ref(instanceCounters('tab-panels'));
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
  <div v-if="$slots.default" class="cp-tab-panels" :id="id">
    <component
      v-for="(panel, index) in (panels as VNode[])"
      :key="createLoopKey({ id, index, item: panel, prefix: instance, suffix: 'panel' })"
      :is="panel"
      :active="active === index"
      :data-cp-active="active === index ? true : undefined"
    />
  </div>
</template>
