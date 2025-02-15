<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

import type { DescriptionListItem as DescriptionListItemProps } from './DescriptionListItem.vue';

type DescriptionList = {
  /**
   * Set the alignment for the description list, default is vertical.
   */
  alignment?: 'horizontal';
  /**
   * Set the distance between each description list.
   */
  density?: 'compact';
  /**
   * Set the reading direction, default is from left to right (ltr).
   */
  direction?: 'rtl';
  /**
   * Set the content for each item of description list.
   */
  items?: DescriptionListItemProps[];
};

defineOptions({ inheritAttrs: false });

const props = defineProps<DescriptionList>();

const classes  = computed(() => ({
  'cp-description-list'            : true,
  'cp-description-list--horizontal': props.alignment === 'horizontal',
  'cp-description-list--rtl'       : props.direction === 'rtl',
  'cp-description-list--compact'   : props.density === 'compact',
}));

const DescriptionListItem = defineAsyncComponent(() => import('./DescriptionListItem.vue'));
</script>

<template>
  <dl v-if="items" :class="classes" v-bind="$attrs">
    <component
      :is="DescriptionListItem"
      :key="index"
      v-for="(item, index) in items"
      :title="item.title"
      :description="item.description"
    />
  </dl>
  <dl v-else :class="classes" v-bind="$attrs">
    <slot />
  </dl>
</template>

<style lang="scss">
.cp-description-list {
  margin: 0;
}
</style>
