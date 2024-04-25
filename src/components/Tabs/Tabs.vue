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
const controls = ref();
const panels = ref();
const tabs = ref();
const active_index = ref<number>(props.modelValue ? props.modelValue : 0);
const tabs_class = computed(() => ({
  'cp-tabs-controls': true,
  'cp-tabs-controls--alternate': props.variant === 'alternate',
  'cp-tabs-controls--grow': props.grow,
  'cp-tabs-controls--sticky': props.sticky,
}));

const scrollToView = (index: number) => {
  const visible = isVisible(tabs.value[index], controls.value);

  if (!visible) tabs.value[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
};

const handleTab = (index: number) => {
  active_index.value = index;

  if (props.modelValue !== undefined) emit('update:modelValue', index);

  !props.grow && scrollToView(index);
};

const handleSticky = (sticky: boolean) => {
  if (sticky) {
    const { height, top } = controls.value.getBoundingClientRect();

    controls.value.style.top = `${top}px`;
    panels.value.style.marginTop = `${height}px`;
    // panels.value.style.paddingTop = `${height}px`;
  } else {
    controls.value.style.top = '';
    panels.value.style.marginTop = '';
    // panels.value.style.paddingTop = '';
  }
}

onMounted(() => {
  props.sticky && handleSticky(true);
  !props.grow && scrollToView(active_index.value);
});

watch(
  () => props.sticky,
  (sticky) => {
    handleSticky(sticky);
  },
);

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
    ref="controls"
    :[scope_id]="''"
    v-if="$slots.default"
    v-bind="controlContainerProps"
    :class="tabs_class"
  >
    <div class="cp-tabs-controls-container">
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
        <template v-else>
          <span>{{ (tab.props as TabProps)?.title }}</span>
        </template>
      </button>
    </div>
  </div>
  <div
    ref="panels"
    :[scope_id]="''"
    v-if="$slots.default"
    v-bind="panelContainerProps"
    class="cp-tabs-panels"
  >
    <component
      v-for="(tab, index) in $slots.default().filter((slot) => (slot.type as TabSlot).name === 'Tab')"
      v-bind="{
        props: panelProps,
        ...{ scope_id: scope_id ? scope_id : '' },
      }"
      :is="tab"
      :key="index"
      :active="active_index === index"
      :index="index"
    />
  </div>
</template>

<style lang="scss">
$root: '.cp-tabs-controls';

.cp-tabs-controls {
  max-width: 100%;
  width: fit-content;
  position: relative;

  &-container {
    display: flex;
    overflow: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background-color: #ecebed;
      border-radius: 24px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #b2b4bd;
      border-radius: 24px;
    }
  }

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
    position: fixed;
    z-index: 50;

    &::before {
      content: '';
      width: 100%;
      height: 50%;
      box-shadow:
        rgba(0, 0, 0, 0.16) 0 3px 6px,
        rgba(0, 0, 0, 0.23) 0 3px 6px;
      position: absolute;
      bottom: 0;
      z-index: -1;
      pointer-events: none;
    }
  }

  &--grow {
    width: 100%;

    #{$root}-container {
      width: 100%;
    }
  }
}

@include screen-md {
  .cp-tabs-controls {
    &-container {
      scrollbar-width: auto;

      &::-webkit-scrollbar {
        display: initial;
      }
    }
  }
}
</style>
