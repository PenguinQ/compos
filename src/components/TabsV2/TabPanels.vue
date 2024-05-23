<script setup lang="ts">
import { computed } from 'vue';

type TabPanelsProps = {
  modelValue: string | number;
};

defineOptions({ name: 'TabPanels' });
const props = defineProps<TabPanelsProps>();
const active = computed(() => props.modelValue);
</script>

<template>
  <div v-if="$slots.default" class="cp-tab-panels">
    <component
      v-for="(panel, index) in $slots.default()"
      :is="panel"
      :active="active === index"
      :data-cp-active="active === index ? true : undefined"
    />
  </div>
</template>
