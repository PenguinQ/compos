<script lang="ts">
export default { name: 'Tabs', inheritAttrs: false };
</script>
<script setup lang="ts">
import {
  computed,
  reactive,
  ref,
  watch,
  onBeforeMount,
  onMounted,
} from 'vue';
import type { VNode } from 'vue'
import type { Props as TabProps } from './Tab.vue';
import { useScopeId } from '@hooks';

type TabSlot = VNode & {
  name?: string;
}

type Props = {
  grow?: boolean;
  modelValue?: number | string,
  sticky?: boolean;
  controlContainerProps?: object;
  controlProps?: object;
  panelContainerProps?: object;
  panelProps?: object;
}

const props = withDefaults(defineProps<Props>(), {
  grow: false,
});

const emits = defineEmits(['update:modelValue']);

const scope_id = useScopeId();
const tabs_container = ref();
const active_index = ref<number>(0);
const tabs_class = computed(() => ({
  'cp-tabs-controls': true,
  'cp-tabs-controls--grow': props.grow,
  'cp-tabs-controls--sticky': props.sticky,
}));
const tab_style = reactive({
  top: props.sticky,
});

onBeforeMount(() => {
  if (props.modelValue) active_index.value = parseInt(props.modelValue as string);
});

onMounted(() => {
  if (props.sticky) {
    const { top } = tabs_container.value.getBoundingClientRect();
    const space = `${top}px`;

    tabs_container.value.style.top = space;
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    active_index.value = parseInt(newValue as string);
  }
);

const handleTab = (index: number) => {
  if (props.modelValue !== undefined) {
    emits('update:modelValue', index);
  } else {
    active_index.value = index;
  }
};
</script>

<template>
  <div
    ref="tabs_container"
    v-if="$slots.default"
    :[scope_id]="''"
    v-bind="controlContainerProps"
    :class="tabs_class"
    :style="tab_style"
  >
    <button
      v-for="(tab, index) in $slots.default().filter((slot) => (slot.type as TabSlot).name === 'Tab')"
      v-bind="{ ...controlProps, ...tab.props?.controlProps}"
      :key="index"
      class="cp-tabs-control"
      role="tab"
      :data-cp-active="active_index === index ? true : undefined"
      @click="handleTab(index)"
    >
      <component v-if="(tab.children as TabProps).title" :is="(tab.children as TabProps).title" />
      <template v-else>{{ (tab.props as TabProps).title }}</template>
    </button>
  </div>
  <div
    v-if="$slots.default"
    :[scope_id]="''"
    v-bind="panelContainerProps"
    class="cp-tabs-panels"
  >
    <component
      v-for="(tab, index) in $slots.default().filter((slot) => (slot.type as TabSlot).name === 'Tab')"
      v-bind="{ root: panelProps, scope_id }"
      :is="tab"
      :key="index"
      :active="active_index === index"
      :index="index"
    />
  </div>
</template>

<style lang="scss">
.cp-tabs-controls {
  display: flex;

  &::-webkit-scrollbar {
    height: 5px;
  }

  &::-webkit-scrollbar-track {
    background-color: #ecebed;
    border-radius: 24px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #b2b4bd;
    border-radius: 24px;
  }

  &--sticky {
    position: sticky;
  }

  &--grow {
    .cp-tabs-control {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      flex: 1 1 auto;
    }
  }
}
</style>
