<script setup lang="ts">
import { computed, reactive } from 'vue';
import ListItem from './ListItem.vue';
import type { ListItemProps } from './ListItem.vue';

type ItemProps = {
  props: object;
};

type ListProps = {
  inset?: boolean;
  items?: ListItemProps[];
};

const props = withDefaults(defineProps<ListProps>(), {
  inset: false,
});

const classes = computed(() => ({
  'cp-list': true,
  'cp-list--inset': props.inset,
}));
</script>

<template>
  <div :class="classes">
    <ListItem
      :key="item.title"
      v-for="item of items"
      :title="item.title"
      :titleAs="item.titleAs"
      :subtitle="item.subtitle"
      :subtitleAs="item.subtitleAs"
      :prepend="item.prepend"
    />
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
