<script setup lang="ts">
import { reactive } from 'vue';
import type * as CSS from 'csstype';
import type { ButtonHTMLAttributes } from 'vue';

interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {
  backgroundColor?: CSS.Property.BackgroundColor;
}

const props = defineProps<Props>();

const buttonStyle = reactive({
  backgroundColor: props.backgroundColor,
});
</script>

<template>
  <button class="cp-navbar-action" type="button" :style="buttonStyle">
    <span class="cp-navbar-action__content">
      <slot />
    </span>
  </button>
</template>

<style lang="scss">
.cp-navbar-action {
  $root: &;

  min-width: var(--navbar-height);
  color: var(--color-white);
  font-size: var(--text-body-large-size);
  line-height: var(--text-body-large-height);
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: box-shadow var(--transition-duration-normal) var(--transition-timing-function);

  &__content {
    transition: transform var(--transition-duration-normal) var(--transition-timing-function);
  }

  &:not(:disabled):active {
    box-shadow: 0 0 56px rgba(37, 52, 70, 0.28) inset;

    #{$root}__content {
      transform: scale(0.90);
    }
  }
}
</style>
