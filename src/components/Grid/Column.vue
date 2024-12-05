<script setup lang="ts">
import { computed } from 'vue';
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
  /**
   * Set the self-alignment of the column, has the same values with **CSS self-align** property.
   */
  align?: CSS.Property.AlignSelf;
  /**
   * Set the size of the column, maximum 12.
   */
  col?: number | string | ColumnAlign;
  /**
   * Set the order of the column, has the same values with **CSS order** property.
   */
  order?: CSS.Property.Order;
  /**
   * Set the offset distance of the column.
   */
  offset?: number | string | ColumnOffset;
};

const props = defineProps<Column>();

const columnBreakpoints = computed(() => ({
  'data-cp-col'    : typeof props.col === 'object' ? props.col?.default : props.col ? props.col : undefined,
  'data-cp-col-sm' : typeof props.col === 'object' ? props.col?.sm : undefined,
  'data-cp-col-md' : typeof props.col === 'object' ? props.col?.md : undefined,
  'data-cp-col-lg' : typeof props.col === 'object' ? props.col?.lg : undefined,
  'data-cp-col-xl' : typeof props.col === 'object' ? props.col?.xl : undefined,
  'data-cp-col-xxl': typeof props.col === 'object' ? props.col?.xxl : undefined,
}));

const columnOffsets = computed(() => ({
  'data-cp-offset'    : typeof props.offset === 'object' ? props.offset?.default : props.offset ? props.offset : undefined,
  'data-cp-offset-sm' : typeof props.offset === 'object' ? props.offset?.sm : undefined,
  'data-cp-offset-md' : typeof props.offset === 'object' ? props.offset?.md : undefined,
  'data-cp-offset-lg' : typeof props.offset === 'object' ? props.offset?.lg : undefined,
  'data-cp-offset-xl' : typeof props.offset === 'object' ? props.offset?.xl : undefined,
  'data-cp-offset-xxl': typeof props.offset === 'object' ? props.offset?.xxl : undefined,
}));

const columnStyle = computed(() => ({
  'order'     : props.order,
  'align-self': props.align,
}));
</script>

<template>
  <div
    class="cp-column"
    v-bind="{ ...columnBreakpoints, ...columnOffsets }"
    :style="columnStyle"
  >
    <slot />
  </div>
</template>

<style lang="scss">
@import './variables';
@import './mixins';

.cp-column {
  // min-width: 0;
  max-width: 100%;
  flex: 1 0 0%;
}

@include create-column('column');
@include create-column-offset();

@include screen-sm {
  @include create-column('column', 'sm');
  @include create-column-offset('sm');
}

@include screen-md {
  @include create-column('column', 'md');
  @include create-column-offset('md');
}

@include screen-lg {
  @include create-column('column', 'lg');
  @include create-column-offset('lg');
}

@include screen-xl {
  @include create-column('column', 'xl');
  @include create-column-offset('xl');
}

@include screen-xxl {
  @include create-column('column', 'xxl');
  @include create-column-offset('xxl');
}
</style>
