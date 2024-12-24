<script setup lang="ts">
import { computed } from 'vue';
import ListItem from './ListItem.vue';
import type { ListItemProps } from './ListItem.vue';

type List = {
  /**
   * Set the inset spacing.
   */
  inset?: boolean;
  /**
   * Set the list of item to be shown on the list.
   */
  items?: ListItemProps[];
};

const props = withDefaults(defineProps<List>(), {
  inset: false,
});

const classes = computed(() => ({
  'cp-list'       : true,
  'cp-list--inset': props.inset,
}));
</script>

<template>
  <div :class="classes">
    <ListItem :key="item.title" v-for="item of items" v-bind="item" />
    <slot />
  </div>
</template>

<style lang="scss">
.cp-list {
  background-color: var(--color-white);

  &--inset {
    margin: 16px;
  }
}
</style>
