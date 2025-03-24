<script setup lang="ts">
import { computed, ref, Fragment } from 'vue';
import type { Slot, VNode } from 'vue';

import { instanceCounters } from '@/helpers';

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

const controlCounter = ref(instanceCounters('tab-panels'));
const active = computed(() => props.modelValue);
const panels = computed(() => {
  if (!slots.default) return [];

  return slots.default().map(vnode => {
    if (vnode.type === Fragment) return vnode.children;

    return vnode;
  }).flat();
});

const createKey = (item: VNode, index: number) => {
  if (item.props?.key != null) return item.props.key;

  if (item.props?.id) return item.props.id;

  if (props.id) return `${props.id}-panel-${index}`

  return `${controlCounter.value}-panel-${index}`;
};
</script>

<template>
  <div v-if="$slots.default" class="cp-tab-panels" :id="id">
    <component
      v-for="(panel, index) in (panels as VNode[])"
      :key="createKey(panel, index)"
      :is="panel"
      :active="active === index"
      :data-cp-active="active === index ? true : undefined"
    />
  </div>
</template>
