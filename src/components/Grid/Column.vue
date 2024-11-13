<script setup lang="ts">
import { computed, reactive } from 'vue';
import type * as CSS from 'csstype';

export type ColumnType = {
  [key: string]: number | string;
};

export type ColumnAlign = {
  [key: string]: number | string;
};

export type ColumnOffset = {
  [key: string]: number | string;
};

type Column = {
  align?: CSS.Property.AlignSelf;
  col?: number | string | ColumnAlign;
  order?: CSS.Property.Order;
  offset?: number | string | ColumnOffset;
};

const props = defineProps<Column>();

const { col, offset } = props;

const columnBreakpoints = computed(() => ({
  'data-cp-col': typeof col === 'object' ? col?.default : col ? col : undefined,
  'data-cp-col-md': typeof col === 'object' ? col?.md : undefined,
}));

const columnOffsets = computed(() => ({
  'data-cp-offset': typeof offset === 'object' ? offset?.default : offset ? offset : undefined,
  'data-cp-offset-md': typeof offset === 'object' ? offset?.md : undefined,
}));

const columnStyle = reactive({
  'order': props.order,
  'align-self': props.align,
});
</script>

<template>
  <div
    class="cp-column"
    v-bind="{...columnBreakpoints, ...columnOffsets}"
    :style="columnStyle"
  >
    <slot />
  </div>
</template>

<style lang="scss">
@import './_variables';
@import './_mixins';

.cp-column {
  max-width: 100%;
  min-width: 0;
  flex: 1 0 0%;
}

@include create-column('column');
@include create-column-offset();

@include screen-md {
  @include create-column('column', 'md');
  @include create-column-offset('md');
}
</style>
