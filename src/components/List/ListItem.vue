<script setup lang="ts">
import ListTitle from './ListTitle.vue';
import ListSubtitle from './ListSubtitle.vue';
import type { ListTitleAs } from './ListTitle.vue';
import type { ListSubtitleAs } from './ListSubtitle.vue';

export type ListItemProps = {
  title?: string;
  titleAs?: ListTitleAs;
  subtitle?: string;
  subtitleAs?: ListSubtitleAs;
  prepend?: any;
  append?: any;
};

defineProps<ListItemProps>();
</script>

<template>
  <div class="cp-list-item">
    <div v-if="$slots.prepend || prepend" class="cp-list-item__prepend">
      <slot name="prepend" />
      <template v-if="prepend">{{ prepend }}</template>
    </div>
    <div class="cp-list-item__content">
      <ListTitle v-if="title" :as="titleAs" v-html="title" />
      <ListSubtitle v-if="subtitle" :as="subtitleAs" v-html="subtitle" />
      <slot />
    </div>
    <div v-if="$slots.append || append" class="cp-list-item__append">
      <slot name="append" />
      <template v-if="append">{{ append }}</template>
    </div>
  </div>
</template>

<style lang="scss">
.cp-list-item {
  padding: 12px 16px;
}
</style>
