<script lang="ts">
export default { name: 'Tab', inheritAttrs: false };
</script>
<script setup lang="ts">
import { reactive, ref, watch, onBeforeMount } from 'vue';
import type * as CSS from 'csstype';

export type Props = {
  active?: boolean;
  index?: number;
  lazy?: boolean;
  title: string;
  padding?: CSS.Property.Padding;
  controlProps?: object;
  panelProps?: object;
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

defineExpose({ ref: tab });
</script>

<template>
  <template v-if="lazy">
    <div
      ref="tab"
      v-if="lazy_tab"
      v-bind="{...($attrs.root as object), ...panelProps}"
      v-bind:[`${$attrs.scope_id}`]="''"
      class="cp-tabs-panel"
      role="tabpanel"
      :style="panel_style"
    >
      <slot />
    </div>
  </template>
  <template v-else>
    <div
      ref="tab"
      v-show="active"
      v-bind="{...($attrs.root as object), ...panelProps}"
      v-bind:[`${$attrs.scope_id}`]="''"
      class="cp-tabs-panel"
      role="tabpanel"
      :style="panel_style"
    >
      <slot />
    </div>
  </template>
</template>

<style lang="scss">
.cp-tabs-control {
  color: var(--color-white);
  font-size: var(--text-body-medium-size);
  line-height: var(--text-body-medium-height);
  font-weight: 600;
  background-color: var(--color-black);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  position: relative;
  cursor: pointer;
  padding: 14px 32px;

  &::before {
    content: "";
    width: 0;
    height: 2px;
    position: absolute;
    bottom: 0;
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
