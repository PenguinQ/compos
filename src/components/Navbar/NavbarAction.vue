<script setup lang="ts">
import { computed } from 'vue';
import type { ButtonHTMLAttributes } from 'vue';
import type * as CSS from 'csstype';

interface NavbarActionProps extends /* @vue-ignore */ ButtonHTMLAttributes {
  icon?: boolean;
  backgroundColor?: CSS.Property.BackgroundColor;
}

const props = withDefaults(defineProps<NavbarActionProps>(), {
  icon: false,
});

const button_class = computed(() => ({
  'cp-navbar-action': true,
  'cp-navbar-action--icon': props.icon,
}));
</script>

<template>
  <button :class="button_class" type="button" :style="{ backgroundColor }">
    <span class="cp-navbar-action__wrapper">
      <slot />
    </span>
  </button>
</template>

<style lang="scss">
.cp-navbar-action {
  $root: &;

  min-width: var(--navbar-height);
  height: var(--navbar-height);
  color: var(--color-white);
  font-size: var(--text-body-large-size);
  line-height: var(--text-body-large-height);
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
    width: var(--navbar-height);
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
