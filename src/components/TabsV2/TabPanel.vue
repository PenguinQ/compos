<script setup lang="ts">
import { ref, onBeforeMount, watch } from 'vue';
import type * as CSS from 'csstype';

type TabPanel = {
  active?: boolean; // Internal props
  lazy?: boolean;
  padding?: CSS.Property.Padding;
  margin?: CSS.Property.Margin;
};

defineOptions({ name: 'TabPanel', inheritAttrs: false });

const props = withDefaults(defineProps<TabPanel>(), {
  lazy: false,
});

const tabRef  = ref<HTMLDivElement | null>(null);
const tabLazy = ref(false);

onBeforeMount(() => {
  if (props.lazy) {
    if (props.active) tabLazy.value = true;
  }
});

watch(
  () => props.active,
  (active) => {
    if (props.lazy) {
      if (active) {
        tabLazy.value = true;

        if (tabRef.value) tabRef.value.style.display = '';
      } else {
        if (tabRef.value) tabRef.value.style.display = 'none';
      }
    }
  },
);
</script>

<template>
  <template v-if="lazy">
    <div
      v-bind="$attrs"
      v-if="tabLazy"
      ref="tabRef"
      class="cp-tab-panel"
      role="tabpanel"
      :style="{ padding, margin }"
    >
      <slot />
    </div>
  </template>
  <template v-else>
    <div
      v-bind="$attrs"
      v-show="active"
      ref="tabRef"
      class="cp-tab-panel"
      role="tabpanel"
      :style="{ padding, margin }"
    >
      <slot />
    </div>
  </template>
</template>
