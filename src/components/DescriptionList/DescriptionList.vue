<script lang="ts">
export default { inheritAttrs: false };
</script>
<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useScopeId } from '@/hooks';

type DescriptionListItem = {
  title: string;
  description: string | number;
  props?: object;
};

type DescriptionListProps = {
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
  items?: DescriptionListItem[];
};

const props = defineProps<DescriptionListProps>();

const scope_id  = useScopeId();
const listClass = computed(() => ({
  'cp-description-list'            : true,
  'cp-description-list--horizontal': props.alignment === 'horizontal',
  'cp-description-list--rtl'       : props.direction === 'rtl',
  'cp-description-list--compact'   : props.density === 'compact',
}));

const DescriptionListItem = defineAsyncComponent(() => import('./DescriptionListItem.vue'));
</script>

<template>
  <template v-if="items">
    <dl :class="listClass" v-bind="$attrs">
      <component
        :is="DescriptionListItem"
        :[`${scope_id}`]="''"
        :key="item.title"
        v-for="item in items"
        v-bind="{ ...item.props, ...{ scope_id: scope_id ? scope_id : '' } }"
        :title="item.title"
        :description="item.description"
      />
    </dl>
  </template>
  <dl v-else :class="listClass" v-bind="$attrs">
    <slot />
  </dl>
</template>

<style lang="scss">
.cp-description-list {
  margin: 0;
}
</style>
