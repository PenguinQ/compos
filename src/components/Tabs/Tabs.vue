<script setup lang="ts">
import { reactive, ref, useSlots, watch, onBeforeMount } from 'vue';
import type { Slots, VNode } from 'vue'

interface Props {
  grow?: boolean;
  modelValue?: number | string,
}

const props = withDefaults(defineProps<Props>(), {
  grow: false,
});

const emits = defineEmits(['update:modelValue']);

const slots: Slots = useSlots();
const activeIndex = ref<number>(0);
const tabs = ref<any>([]);
const tabsClass = reactive({
  'cp-tabs': true,
  'cp-tabs--grow': props.grow,
});

onBeforeMount(() => {
  // Old
  // if (slots.default) {
  //   slots.default().forEach((slot: any) => {
  //     if (slot.children.length > 1) {
  //       tabs.value = [
  //         ...tabs.value,
  //         ...slot.children.filter((child: any) => child.type.__name === 'Tab'),
  //       ];
  //     }
  //     if (slot.type.__name === 'Tab') {
  //       tabs.value.push(slot);
  //     }
  //   });
  // }

  // if (props.modelValue) activeIndex.value = parseInt(props.modelValue as string);

  if (slots.default) {
    tabs.value = slots.default().filter((slot: any) => slot.type.__name === 'AppTab');
  }

  if (props.modelValue) activeIndex.value = parseInt(props.modelValue as string);
})

const handleTab = (index: number) => {
  if (props.modelValue !== undefined) {
    emits('update:modelValue', index);
  } else {
    activeIndex.value = index;
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    activeIndex.value = parseInt(newValue as string);
  }
);
</script>

<template>
  <div
    v-if="$slots.default"
    :class="tabsClass"
  >
    <button
      v-for="(tab, index) in tabs"
      class="cp-tab"
      role="tab"
      :key="index"
      :data-cp-active="activeIndex === index ? true : undefined"
      @click="handleTab(index)"
    >
      <component v-if="tab.children.title" :is="tab.children.title" />
    </button>
  </div>
  <div class="cp-tabs-panels">
    <component
      v-for="(tab, index) in tabs"
      :is="tab"
      :key="index"
      :active="activeIndex === index"
      :index="index"
      role="tabpanel"
    />
  </div>
</template>

<style lang="scss"></style>
