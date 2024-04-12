<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import type { VNode } from 'vue';
import type { TabProps } from './Tab.vue';

import { isVisible } from '@helpers';
import { useScopeId } from '@hooks';

type TabSlot = VNode & {
  name?: string;
};

type TabsProps = {
  /**
   * Set the tab buttons to take the whole width.
   */
  grow?: boolean;
  /**
   * Set the current active tab programmatically.
   */
  modelValue?: number;
  /**
   * TBA.
   */
  sticky?: boolean;
  /**
   * Set additional properties for container of the tab buttons.
   */
  controlContainerProps?: object;
  /**
   * Set additional properties for all tab buttons.
   */
  controlProps?: object;
  /**
   * Set additional properties for container of the tab panels.
   */
  panelContainerProps?: object;
  /**
   * Set additional properties for all tab panels.
   */
  panelProps?: object;
  /**
   * Set the style variant of the tab controls.
   */
  variant?: 'alternate';
};

defineOptions({
  name: 'Tabs',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<TabsProps>(), {
  grow: false,
  sticky: false,
});
const emit = defineEmits(['update:modelValue']);

const scope_id = useScopeId();
const tabs_container = ref();
const tabs = ref();
const active_index = ref<number>(props.modelValue ? props.modelValue : 0);
const tabs_class = computed(() => ({
  'cp-tabs-controls': true,
  'cp-tabs-controls--alternate': props.variant === 'alternate',
  'cp-tabs-controls--grow': props.grow,
  'cp-tabs-controls--sticky': props.sticky,
}));

const scrollToView = (index: number) => {
  const visible = isVisible(tabs.value[index], tabs_container.value);

  if (!visible) tabs.value[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
};

const handleTab = (index: number) => {
  active_index.value = index;

  if (props.modelValue !== undefined) emit('update:modelValue', index);

  !props.grow && scrollToView(index);
};

onMounted(() => {
  if (props.sticky) {
    const { top } = tabs_container.value.getBoundingClientRect();
    const space = `${top}px`;

    tabs_container.value.style.top = space;
  }

  !props.grow && scrollToView(active_index.value);
});

watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) {
      active_index.value = value;
      !props.grow && scrollToView(value);
    }
  },
);
</script>

<template>
  <div
    ref="tabs_container"
    v-if="$slots.default"
    :[scope_id]="''"
    v-bind="controlContainerProps"
    :class="tabs_class"
  >
    <button
      ref="tabs"
      v-for="(tab, index) in $slots.default().filter((slot) => (slot.type as TabSlot).name === 'Tab')"
      v-bind="{ ...controlProps, ...tab.props?.controlProps }"
      :[scope_id]="''"
      :key="index"
      class="cp-tabs-control"
      role="tab"
      :data-cp-active="active_index === index ? true : undefined"
      @click="handleTab(index)"
    >
      <component v-if="(tab.children as TabProps)?.title" :is="(tab.children as TabProps).title" />
      <template v-else><span>{{ (tab.props as TabProps)?.title }}</span></template>
    </button>
  </div>
  <div v-if="$slots.default" :[scope_id]="''" v-bind="panelContainerProps" class="cp-tabs-panels">
    <component
      v-for="(tab, index) in $slots.default().filter((slot) => (slot.type as TabSlot).name === 'Tab')"
      v-bind="{ props: panelProps, ...{ scope_id: scope_id ? scope_id : '' } }"
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
  overflow: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: #ECEBED;
    border-radius: 24px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #B2B4BD;
    border-radius: 24px;
  }

  &--sticky {
    position: sticky;
  }

  &--grow {
    overflow: hidden;
  }
}

@include screen-md {
  .cp-tabs-controls {
    scrollbar-width: auto;

    &::-webkit-scrollbar {
      display: initial;
    }
  }
}
</style>
