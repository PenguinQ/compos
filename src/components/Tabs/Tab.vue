<script setup lang="ts">
import { ref, watch, onBeforeMount } from 'vue';

interface Props {
  active?: boolean;
  index?: number;
  lazy?: boolean;
  title: string;
}

const props = withDefaults(defineProps<Props>(), {
  lazy: false,
});

const tab = ref<HTMLDivElement | null>(null)
const lazyTab = ref(false);

onBeforeMount(() => {
  if (props.lazy) {
    if (props.active) lazyTab.value = true;
  }
});

watch(
  () => props.active,
  (newActive) => {
    if (props.lazy) {
      if (newActive) {
        lazyTab.value = true;
        if (tab.value) tab.value.style.display = '';
      } else {
        if (tab.value) tab.value.style.display = 'none';
      }
    }
  },
);

defineExpose({ ref: tab });
</script>

<template>
  <template v-if="lazy">
    <div v-if="lazyTab" ref="tab" class="cp-panel" v-bind="$attrs">
      <slot></slot>
    </div>
  </template>
  <template v-else>
    <div v-show="active" class="cp-panel" v-bind="$attrs">
      <slot></slot>
    </div>
  </template>
</template>

<style lang="scss"></style>
