<script setup lang="ts">
import { reactive } from 'vue';
import type * as CSS from 'csstype';
import type { ColumnType } from './Column.vue';

interface GutterType {
  col?: number | string | null;
  row?: number | string | null;
}

interface Props {
  align?: CSS.Property.AlignItems;
  col?: number | string | ColumnType;
  direction?: CSS.Property.FlexDirection;
  gutter?: number | string | GutterType;
  justify?: CSS.Property.JustifyContent;
  margin?: CSS.Property.Margin | number;
}

const props = defineProps<Props>();

const { col, gutter } = props;
const gutters: GutterType = { col: null, row: null };

if (gutter) {
  if (typeof gutter === 'object') {
    gutters.col = typeof gutter.col === 'number' ? `${gutter.col}px` : gutter.col;
    gutters.row = typeof gutter.row === 'number' ? `${gutter.row}px` : gutter.row;
  } else if (typeof gutter === 'number') {
    gutters.col = `${gutter}px`;
    gutters.row = `${gutter}px`;
  } else {
    gutters.col = gutter;
    gutters.row = gutter;
  }
}

const columnBreakpoints = reactive({
  'data-cp-col': typeof col === 'object' ? col?.default : col ? col : undefined,
  'data-cp-col-md': typeof col === 'object' ? col?.md : undefined,
});

const rowStyle = reactive({
  '--gutter-col': gutters.col,
  '--gutter-row': gutters.row,
  'flex-direction': props.direction,
  'align-items': props.align,
  'justify-content': props.justify,
  'margin': props.margin,
});
</script>

<template>
  <div class="cp-row" v-bind="columnBreakpoints" :style="rowStyle">
    <slot></slot>
  </div>
</template>

<style lang="scss">
@import './_variables';
@import './_mixins';

.cp-row {
  display: flex;
  flex-wrap: wrap;
  column-gap: $gutterColumn;
  row-gap: $gutterRow;
}

@include create-column('row');

@include screen-md {
  @include create-column('row', 'md');
}
</style>
