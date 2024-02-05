<script lang="ts">
export default { inheritAttrs: false };
</script>
<script setup lang="ts">
import {
  reactive,
  ref,
  toRef,
  toRefs,
  useSlots,
  watch,
  onBeforeMount,
  onMounted,
  getCurrentInstance,
} from 'vue';
import type { Slots, VNode } from 'vue'
import type { Props as TabProps } from './Tab.vue';

type Props = {
  grow?: boolean;
  modelValue?: number | string,
  sticky?: boolean;
  controlProps?: object;
  panelProps?: object;
}

const props = withDefaults(defineProps<Props>(), {
  grow: false,
});

const emits = defineEmits(['update:modelValue']);

const slots: Slots = useSlots();
const tabs_container = ref();
const tabs = ref<VNode[]>([]);
const panel_height = ref<string>('');
const active_index = ref<number>(0);
const scope_id = ref<string | null | undefined>('');
const tabs_class = reactive({
  'cp-tabs-controls': true,
  'cp-tabs-controls--grow': props.grow,
  'cp-tabs': true,
  'cp-tabs--grow': props.grow,
  'cp-tabs--sticky': props.sticky,
});
const tab_style = reactive({
  top: props.sticky,
});

onBeforeMount(() => {
  scope_id.value = getCurrentInstance()?.vnode.scopeId;

  if (slots.default) {
    tabs.value = slots.default().filter((slot: any) => slot.type.__name === 'Tab');
  }

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
    v-bind:[`${scope_id}`]="''"
    v-bind="$attrs"
    :class="tabs_class"
    :style="tab_style"
  >
    <button
      v-for="(tab, index) in tabs"
      v-bind="{ ...controlProps, ...tab.props?.controlProps}"
      :key="index"
      :data-cp-active="active_index === index ? true : undefined"
      class="cp-tabs-control cp-tab"
      role="tab"
      @click="handleTab(index)"
    >
      <component v-if="(tab.children as TabProps).title" :is="(tab.children as TabProps).title" />
      <template v-else>
        {{ (tab.props as TabProps).title }}
      </template>
    </button>
  </div>
  <div v-bind="$attrs" class="cp-tabs-panels">
    <component
      v-for="(tab, index) in tabs"
      v-bind="{ root: panelProps }"
      :is="tab"
      :key="index"
      :active="active_index === index"
      :index="index"
    />
  </div>
</template>

<style lang="scss">
.cp-tabs {
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
}

.cp-tab {
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

  .cp-tabs--grow & {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex: 1 1 auto;
  }
}
</style>
