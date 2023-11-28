<script setup lang="ts">
import { reactive } from 'vue';
import type * as CSS from 'csstype';
import type { ColumnType } from './Column.vue';

interface GutterType {
  column?: number | string | null;
  row?: number | string | null;
}

interface Props {
  align?: CSS.Property.AlignItems;
  column?: number | string | ColumnType;
  direction?: CSS.Property.FlexDirection;
  gutter?: number | string | GutterType;
  justify?: CSS.Property.JustifyContent;
  margin?: CSS.Property.Margin | number;
}

const props = defineProps<Props>();

const { column, gutter } = props;
const gutters: GutterType = { column: null, row: null };

if (gutter) {
  if (typeof gutter === 'object') {
    gutters.column = typeof gutter.column === 'number' ? `${gutter.column}px` : gutter.column;
    gutters.row = typeof gutter.row === 'number' ? `${gutter.row}px` : gutter.row;
  } else if (typeof gutter === 'number') {
    gutters.column = `${gutter}px`;
    gutters.row = `${gutter}px`;
  } else {
    gutters.column = gutter;
    gutters.row = gutter;
  }
}

const columnBreakpoints = reactive({
  'data-cp-column': typeof column === 'object' ? column?.default : column ? column : undefined,
  'data-cp-column-md': typeof column === 'object' ? column?.md : undefined,
});

const rowStyle = reactive({
  '--gutter-col': gutters.column,
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
