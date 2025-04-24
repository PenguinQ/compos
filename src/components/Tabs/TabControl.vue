<script setup lang="ts">
import type { Slot } from 'vue';

type TabControl = {
  /**
   * Set the TabControl text.
   */
  title?: string;
};

type TabControlSlots = {
  title?: Slot;
};

defineOptions({ name: 'TabControl' });
defineProps<TabControl>();
defineSlots<TabControlSlots>();
</script>

<template>
  <button v-bind="$attrs" class="cp-tab-control" type="button" role="tab">
    <template v-if="$slots.title" name="title" />
    <template v-else>{{ title }}</template>
  </button>
</template>

<style lang="scss">
.cp-tab-control {
  @include text-body-md;
  height: var(--tab-height);
  color: var(--color-white);
  font-family: var(--text-heading-family);
  font-weight: 400;
  background-color: var(--color-black);
  flex: 0 0 auto;
  border: none;
  position: relative;
  cursor: pointer;
  padding: 0 32px;

  .cp-tab-controls--grow & {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    flex: 1 1 auto;
    padding-right: 0;
    padding-left: 0;
  }

  .cp-tab-controls--alternate & {
    color: var(--color-black);
    background-color: var(--color-white);

    &::before {
      background-color: var(--color-black);
    }
  }

  &::before {
    content: "";
    width: 0;
    height: 3px;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--color-white);
    transition: width var(--transition-duration-very-fast) var(--transition-timing-function);
  }

  &[data-cp-active] {
    font-weight: 600;

    &:before {
      width: 100%;
    }
  }

  .cp-toolbar & {
    background-color: transparent;
  }
}
</style>
