<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';

import { isVisible } from '@helpers';
import { useScopeId } from '@hooks';

type TabControlsProps = {
  grow?: boolean;
  modelValue: number;
  sticky?: boolean;
  variant?: 'alternate';
};

defineOptions({ name: 'TabControls' });
const props = withDefaults(defineProps<TabControlsProps>(), {
  grow: false,
  sticky: false,
});
const emit = defineEmits(['update:modelValue']);

const scope_id = useScopeId();
const container = ref();
const scroller = ref();
const active = ref(props.modelValue ? props.modelValue : 0);
const tabs_class = computed(() => ({
  'cp-tab-controls': true,
  'cp-tab-controls--grow': props.grow,
  'cp-tab-controls--alternate': props.variant === 'alternate',
}));

const scrollToView = (index: number) => {
  const controls = scroller.value.children;
  const control = controls[index];

  if (control) {
    const visible = isVisible(control, container.value);

    if (!visible) control.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
};

const handleTab = (index: number) => {
  active.value = index;

  if (props.modelValue !== undefined) emit('update:modelValue', index);

  !props.grow && scrollToView(index);
};

watch(
  () => props.modelValue,
  (newModel) => {
    active.value = newModel;
    emit('update:modelValue', newModel);
  },
);

onMounted(() => {
  if (!props.grow) scrollToView(active.value);
});
</script>

<template>
  <div v-if="$slots.default" ref="container" :class="tabs_class">
    <div :[scope_id]="''" ref="scroller" class="cp-tab-controls-container">
      <component
        v-for="(tab, index) in $slots.default()"
        :is="tab"
        :data-cp-active="active === index ? true : undefined"
        @click="handleTab(index)"
      />
    </div>
  </div>
</template>

<style lang="scss">
.cp-tab-controls {
  --tab-height: 48px;

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

  &--grow {
    width: 100%;

    .cp-tab-controls-container {
      width: 100%;
    }
  }
}

@include screen-md {
  .cp-tab-controls {
    &-container {
      scrollbar-width: auto;

      &::-webkit-scrollbar {
        display: initial;
      }
    }
  }
}
</style>
