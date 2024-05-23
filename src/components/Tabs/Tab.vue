<script setup lang="ts">
import { ref, watch, onBeforeMount } from 'vue';
import type * as CSS from 'csstype';

export type TabProps = {
  index?: number; // Internal props
  active?: boolean; // Internal props
  lazy?: boolean;
  title: string;
  padding?: CSS.Property.Padding;
  controlProps?: object;
  panelProps?: object;
};

defineOptions({
  name: 'Tab',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<TabProps>(), {
  lazy: false,
});

const tab = ref<HTMLDivElement>();
const lazy_tab = ref(false);

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

defineExpose({ ref: tab });
</script>

<template>
  <template v-if="lazy">
    <div
      ref="tab"
      v-if="lazy_tab"
      v-bind="{ ...($attrs.root_props as object), ...panelProps }"
      :[`${$attrs.scope_id}`]="''"
      class="cp-tabs-panel"
      role="tabpanel"
      :style="{ padding }"
    >
      <slot />
    </div>
  </template>
  <template v-else>
    <div
      ref="tab"
      v-show="active"
      v-bind="{ ...($attrs.root_props as object), ...panelProps }"
      :[`${$attrs.scope_id}`]="''"
      class="cp-tabs-panel"
      role="tabpanel"
      :style="{ padding }"
    >
      <slot />
    </div>
  </template>
</template>

<style lang="scss">
$parent: '.cp-tabs-controls';

.cp-tabs-control {
  height: var(--tab-height);
  color: var(--color-white);
  font-size: var(--text-body-medium-size);
  line-height: var(--text-body-medium-height);
  font-weight: 600;
  background-color: var(--color-black);
  flex: 0 0 auto;
  border: none;
  position: relative;
  cursor: pointer;
  padding: 0 32px;

  #{$parent}--grow & {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    flex: 1 1 auto;
    padding-right: 0;
    padding-left: 0;
  }

  #{$parent}--alternate & {
    color: var(--color-black);
    background-color: var(--color-white);

    &::before {
      background-color: var(--color-black);
    }
  }

  &::before {
    content: '';
    width: 0;
    height: 2px;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--color-white);
    transition: width var(--transition-duration-very-fast) var(--transition-timing-function);
  }

  &[data-cp-active] {
    &:before {
      width: 100%;
    }
  }
}
</style>
