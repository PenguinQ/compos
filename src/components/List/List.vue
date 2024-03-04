<script setup lang="ts">
import ListItem from './ListItem.vue';
import type { ListItemProps } from './ListItem.vue';

type ItemProps = {
  props: object;
};

type ListProps = {
  items?: ListItemProps[];
};

defineProps<ListProps>();
</script>

<template>
  <div class="cp-list">
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

<style lang="scss"></style>
