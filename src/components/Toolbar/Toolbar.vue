<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import type { Slot } from 'vue';

type Toolbar = {
  /**
   * Set the Toolbar title text.
   */
  title?: string;
};

type ToolbarSlots = {
  /**
   * Slot used to create content inside the Dialog.
   */
  default?: Slot;
  /**
   * Slot used to create content for the Dialog extensions.
   */
  extensions?: Slot;
};

defineProps<Toolbar>();
defineSlots<ToolbarSlots>();

const ToolbarTitle = defineAsyncComponent(() => import('./ToolbarTitle.vue'));

const outerRef      = ref<HTMLDivElement | null>(null);
const innerRef      = ref<HTMLDivElement | null>(null);
const extensionsRef = ref<HTMLDivElement | null>(null);

const toggleToolbar = (toggle: boolean) => {
  const outerContainer = outerRef.value;
  const innerContainer = innerRef.value;

  if (outerContainer && innerContainer) {
    const innerHeight = innerContainer.getBoundingClientRect().height;

    outerContainer.style.marginTop = toggle ? `-${innerHeight}px` : '';
  }
};

defineExpose({
  /**
   * Toolbar container.
   */
  outer: outerRef,
  /**
   * Toolbar inner container.
   */
  inner: innerRef,
  /**
   * Toolbar extension container.
   */
  extensions: extensionsRef,
  /**
   * Function to hide Toolbar.
   */
  toggleToolbar,
});
</script>

<template>
  <div ref="outerRef" class="cp-toolbar">
    <div ref="innerRef" class="cp-toolbar__main">
      <ToolbarTitle v-if="title" class="cp-toolbar-title">{{ title }}</ToolbarTitle>
      <slot />
    </div>
    <div v-if="$slots.extensions" ref="extensionRef" class="cp-toolbar__extension">
      <slot name="extensions"></slot>
    </div>
  </div>
</template>

<style lang="scss">
.cp-toolbar {
  --toolbar-height: 56px;
  min-height: var(--toolbar-height);
  background-color: var(--color-black);
  background-image: linear-gradient(180deg, var(--color-black) 0%, #141B25 100%);
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
