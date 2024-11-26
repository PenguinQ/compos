<script setup lang="ts">
type TabControlprops = {
  title?: string;
};

defineOptions({ name: 'TabControl' });
defineProps<TabControlprops>();
</script>

<template>
  <button class="cp-tab-control" type="button" role="tab">
    <template v-if="$slots.title" name="title" />
    <template v-else>{{ title }}</template>
  </button>
</template>

<style lang="scss">
$parent: '.cp-tab-controls';

.cp-tab-control {
  @include text-body-md;
  height: var(--tab-height);
  color: var(--color-white);
  font-weight: 600;
  background-color: var(--color-black);
  flex: 0 0 auto;
  border: none;
  position: relative;
  cursor: pointer;
  padding: 0 32px;

  #{$parent}--grow & {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    flex: 1 1 auto;
    padding-right: 0;
    padding-left: 0;
  }

  #{$parent}--alternate & {
    color: var(--color-black);
    background-color: var(--color-white);

    &::before {
      background-color: var(--color-black);
    }
  }

  &::before {
    content: '';
    width: 0;
    height: 2px;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
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
