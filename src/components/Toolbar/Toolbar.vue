<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

export type ToolbarProps = {
  title?: string;
  sticky?: boolean;
  onBack?: () => void;
};

const props = defineProps<ToolbarProps>();
const emit = defineEmits(['back']);

const ToolbarTitle = defineAsyncComponent(() => import('./ToolbarTitle.vue'));
const toolbar_class = computed(() => ({
  'cp-toolbar': true,
  'cp-toolbar--sticky': props.sticky,
}));
</script>

<template>
  <nav :class="toolbar_class">
    <ToolbarTitle v-if="title" class="cp-toolbar-title">{{ title }}</ToolbarTitle>
    <slot />
  </nav>
</template>

<style lang="scss">
.cp-toolbar {
  --toolbar-height: 56px;
  height: var(--toolbar-height);
  color: var(--color-white);
  background-color: var(--color-black);
  display: flex;
  align-items: center;
  box-shadow:
    rgba(0, 0, 0, 0.16) 0 3px 6px,
    rgba(0, 0, 0, 0.23) 0 3px 6px;

  &-actions {
    display: flex;
    align-self: stretch;
    flex-shrink: 0;

    &:last-child {
      margin-right: -16px;
    }
  }

  &--sticky {
    position: sticky;
    top: 0;
    z-index: 50;
  }
}
</style>
