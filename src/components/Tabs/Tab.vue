<script lang="ts">
export default { inheritAttrs: false };
</script>
<script setup lang="ts">
import { reactive, ref, watch, onBeforeMount, provide } from 'vue';
import type * as CSS from 'csstype';

export type Props = {
  active?: boolean;
  index?: number;
  grow?: boolean;
  lazy?: boolean;
  title: string;
  padding?: CSS.Property.Padding;
}

const props = withDefaults(defineProps<Props>(), {
  lazy: false,
});

const tab = ref<HTMLDivElement | null>(null);
const lazy_tab = ref(false);
const panel_style = reactive({
  padding: props.padding,
});

onBeforeMount(() => {
  if (props.lazy) {
    if (props.active) lazy_tab.value = true;
  }
});

watch(
  () => props.active,
  (newActive) => {
    if (props.lazy) {
      if (newActive) {
        lazy_tab.value = true;

        if (tab.value) tab.value.style.display = '';
      } else {
        if (tab.value) tab.value.style.display = 'none';
      }
    }
  },
);

const scrollToTop = () => {
  if (props.grow) {
    if (tab.value) tab.value.scrollTop = 0;
  } else {
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }
}

defineExpose({ ref: tab });

provide('tab-panel', { scrollToTop })
</script>

<template>
  <template v-if="lazy">
    <div v-if="lazy_tab" ref="tab" class="cp-panel" v-bind="$attrs" :style="panel_style">
      <slot />
    </div>
  </template>
  <template v-else>
    <div v-show="active" ref="tab" class="cp-panel" v-bind="$attrs" :style="panel_style">
      <slot />
    </div>
  </template>
</template>

<style lang="scss">
.cp-panel {
  overflow: auto;
}
</style>
