<script setup lang="ts">
import { computed } from 'vue';

import { Text } from '@/components';
import ListItem from './ListItem.vue';
import type { ListItem as ListItemProps } from './ListItem.vue';

type List = {
  /**
   * Set the title of the List.
   */
  title?: string;
  /**
   * Set the inset spacing of the List.
   */
  inset?: boolean;
  /**
   * Set the list of item to be shown on the List.
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
    <Text v-if="title" class="cp-list__title" heading="3">{{ title }}</Text>
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

  &__title {
    color: var(--color-neutral-5);
    @include text-body-md;
    font-weight: 600;
    background-color: var(--color-neutral-1);
    padding: 16px;
    margin: 0;
  }
}
</style>
