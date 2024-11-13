<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';

type ToolbarProps = {
  title?: string;
  onBack?: () => void;
};

defineProps<ToolbarProps>();
defineEmits(['back']);

const ToolbarTitle = defineAsyncComponent(() => import('./ToolbarTitle.vue'));

const outerContainer     = ref<HTMLDivElement | null>(null);
const innerContainer     = ref<HTMLDivElement | null>(null);
const extensionContainer = ref<HTMLDivElement | null>(null);

const toggleToolbar = (toggle: boolean) => {
  const outer = outerContainer.value;
  const inner = innerContainer.value;

  if (outer && inner) {
    const innerHeight = inner.getBoundingClientRect().height;

    outer.style.marginTop = toggle ? `-${innerHeight}px` : '';
  }
};

defineExpose({
  outer    : outerContainer,
  inner    : innerContainer,
  extension: extensionContainer,
  toggleToolbar,
});
</script>

<template>
  <div ref="outerContainer" class="cp-toolbar">
    <div ref="innerContainer" class="cp-toolbar__main">
      <ToolbarTitle v-if="title" class="cp-toolbar-title">{{ title }}</ToolbarTitle>
      <slot />
    </div>
    <div v-if="$slots.extension" ref="extensionContainer" class="cp-toolbar__extension">
      <slot name="extension"></slot>
    </div>
  </div>
</template>

<style lang="scss">
.cp-toolbar {
  --toolbar-height: 56px;
  min-height: var(--toolbar-height);
  background-color: var(--color-black);
  box-shadow: rgba(0, 0, 0, 0.16) 0 3px 6px, rgba(0, 0, 0, 0.23) 0 3px 6px;
  position: relative;
  z-index: var(--z-10);
  transition: all var(--transition-duration-very-fast) var(--transition-timing-function);
  will-change: margin-top;

  &-actions {
    display: flex;
    align-self: stretch;
    flex-shrink: 0;

    &:last-child {
      margin-right: -16px;
    }
  }

  &__main {
    height: var(--toolbar-height);
    color: var(--color-white);
    display: flex;
    align-items: center;
  }
}
</style>
