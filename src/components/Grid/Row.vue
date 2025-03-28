<script setup lang="ts">
import { computed } from 'vue';
import type * as CSS from 'csstype';
import type { ColumnType } from './Column.vue';

type Gutter =  {
  col?: number | string;
  row?: number | string;
};

type Row = {
  /**
   * Set the alignment of the columns, has the same values with **CSS align-items** property.
   */
  align?: CSS.Property.AlignItems;
  /**
   * Set the size of all column within the row, if one of the column has it's own `col` property set, this will be ignored.
   */
  col?: number | string | ColumnType;
  /**
   * Set the direction of the columns, has the same values with **CSS flex-direction** property.
   */
  direction?: CSS.Property.FlexDirection;
  /**
   * Set the horizontal and vertical spacing between columns.
   */
  gutter?: number | string | Gutter;
  /**
   * Set the justification of the columns, has the same values with **CSS justify-content** property.
   */
  justify?: CSS.Property.JustifyContent;
};

const props = defineProps<Row>();

const gutters: Gutter = { col: undefined, row: undefined };

if (props.gutter != null) {
  if (typeof props.gutter === 'object') {
    gutters.col = typeof props.gutter.col === 'number' ? `${props.gutter.col}px` : props.gutter.col;
    gutters.row = typeof props.gutter.row === 'number' ? `${props.gutter.row}px` : props.gutter.row;
  } else if (typeof props.gutter === 'number') {
    gutters.col = `${props.gutter}px`;
    gutters.row = `${props.gutter}px`;
  } else {
    gutters.col = props.gutter;
    gutters.row = props.gutter;
  }
}

const columnBreakpoints = computed(() => ({
  'data-cp-col'    : typeof props.col === 'object' ? props.col?.default : props.col ? props.col : undefined,
  'data-cp-col-sm' : typeof props.col === 'object' ? props.col?.sm : undefined,
  'data-cp-col-md' : typeof props.col === 'object' ? props.col?.md : undefined,
  'data-cp-col-lg' : typeof props.col === 'object' ? props.col?.lg : undefined,
  'data-cp-col-xl' : typeof props.col === 'object' ? props.col?.xl : undefined,
  'data-cp-col-xxl': typeof props.col === 'object' ? props.col?.xxl : undefined,
}));

const rowStyle = computed(() => ({
  '--gutter-col'   : gutters.col,
  '--gutter-row'   : gutters.row,
  'flex-direction' : props.direction,
  'align-items'    : props.align,
  'justify-content': props.justify,
}));
</script>

<template>
  <div class="cp-row" v-bind="columnBreakpoints" :style="rowStyle">
    <slot></slot>
  </div>
</template>

<style lang="scss">
@import './variables';
@import './mixins';

.cp-row {
  display: flex;
  flex-wrap: wrap;
  column-gap: $gutterColumn;
  row-gap: $gutterRow;
}

@include create-column('row');

@include screen-sm {
  @include create-column('row', 'sm');
}

@include screen-md {
  @include create-column('row', 'md');
}

@include screen-lg {
  @include create-column('row', 'lg');
}

@include screen-xl {
  @include create-column('row', 'xl');
}

@include screen-xxl {
  @include create-column('row', 'xxl');
}
</style>
