<script setup lang="ts">
import { computed } from 'vue';
import type { ButtonHTMLAttributes } from 'vue';
import type * as CSS from 'csstype';

interface ToolbarAction extends /* @vue-ignore */ ButtonHTMLAttributes {
  /**
   * Set the ToolbarAction into icon mode.
   */
  icon?: boolean;
  /**
   * Set the CSS background-color value of the ToolbarAction.
   */
  backgroundColor?: CSS.Property.BackgroundColor;
}

const props = withDefaults(defineProps<ToolbarAction>(), {
  icon: false,
});

const classes = computed(() => ({
  'cp-toolbar-action'      : true,
  'cp-toolbar-action--icon': props.icon,
}));
</script>

<template>
  <button :class="classes" type="button" :style="{ backgroundColor }">
    <span class="cp-toolbar-action__wrapper">
      <slot />
    </span>
  </button>
</template>

<style lang="scss">
.cp-toolbar-action {
  $root: &;

  @include text-body-lg;
  min-width: var(--toolbar-height);
  height: var(--toolbar-height);
  color: var(--color-white);
  background-color: transparent;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
  overflow: hidden;
  padding: 0 8px;
  transition-property: background-color, box-shadow;
  transition-duration: var(--transition-duration-normal);
  transition-timing-function: var(--transition-timing-function);

  &__wrapper {
    transition: transform var(--transition-duration-normal) var(--transition-timing-function);
  }

  &:not(:disabled):active {
    box-shadow: 0 0 56px rgba(37, 52, 70, 0.28) inset;

    #{$root}__wrapper {
      transform: scale(0.86);
    }
  }

  &:last-child {
    margin-right: 16px;
  }

  &--icon {
    width: var(--toolbar-height);
    padding-left: 0;
    padding-right: 0;

    compos-icon {
      max-width: 100%;
      min-height: 100%;
      color: var(--color-white);
    }

    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
