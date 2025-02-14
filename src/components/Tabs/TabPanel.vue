<script setup lang="ts">
import { ref, onBeforeMount, watch, useAttrs } from 'vue';
import type * as CSS from 'csstype';

type TabPanel = {
  /**
   * Set lazy load the TabPanel.
   */
  lazy?: boolean;
  /**
   * Set the CSS padding value of the TabPanel.
   */
  padding?: CSS.Property.Padding;
  /**
   * Set the CSS margin value of the TabPanel.
   */
  margin?: CSS.Property.Margin;
};

defineOptions({ name: 'TabPanel', inheritAttrs: false });

const props = withDefaults(defineProps<TabPanel>(), {
  lazy: false,
});

const attrs   = useAttrs();
const tabRef  = ref<HTMLDivElement | null>(null);
const tabLazy = ref(false);

onBeforeMount(() => {
  if (props.lazy) {
    if (attrs.active) tabLazy.value = true;
  }
});

watch(
  () => attrs.active,
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
      v-bind="{ ...$attrs, 'active': undefined }"
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
      v-bind="{ ...$attrs, 'active': undefined }"
      v-show="$attrs.active"
      ref="tabRef"
      class="cp-tab-panel"
      role="tabpanel"
      :style="{ padding, margin }"
    >
      <slot />
    </div>
  </template>
</template>
