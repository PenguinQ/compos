<script setup lang="ts">
import { ref, onBeforeMount, watch } from 'vue';
import type * as CSS from 'csstype';

type TabPanelProps = {
  active?: boolean; // Internal props
  lazy?: boolean;
  padding?: CSS.Property.Padding;
  margin?: CSS.Property.Margin;
};

defineOptions({
  name: 'TabPanel',
  inheritAttrs: false,
});
const props = withDefaults(defineProps<TabPanelProps>(), {
  lazy: false,
});

const tab = ref<HTMLDivElement>();
const tab_lazy = ref(false);

onBeforeMount(() => {
  if (props.lazy) {
    if (props.active) tab_lazy.value = true;
  }
});

watch(
  () => props.active,
  (active) => {
    if (props.lazy) {
      if (active) {
        tab_lazy.value = true;

        if (tab.value) tab.value.style.display = '';
      } else {
        if (tab.value) tab.value.style.display = 'none';
      }
    }
  },
);
</script>

<template>
  <template v-if="lazy">
    <div
      v-bind="$attrs"
      v-if="tab_lazy"
      ref="tab"
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
      ref="tab"
      class="cp-tab-panel"
      role="tabpanel"
      :style="{ padding, margin }"
    >
      <slot />
    </div>
  </template>
</template>
