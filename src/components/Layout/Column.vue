<script setup lang="ts">
import { reactive } from 'vue';
import type * as CSS from 'csstype';

export interface ColumnType {
  [key: string]: number | string;
}

interface Props {
  align?: CSS.Property.AlignSelf;
  col?: number | string | ColumnType;
  order?: CSS.Property.Order;
}

const props = defineProps<Props>();

const { col } = props;

const columnBreakpoints = reactive({
  'data-cp-col': typeof col === 'object' ? col?.default : col ? col : undefined,
  'data-cp-col-md': typeof col === 'object' ? col?.md : undefined,
});

const columnStyle = reactive({
  'order': props.order,
  'align-self': props.align,
});
</script>

<template>
  <div class="cp-column" v-bind="columnBreakpoints" :style="columnStyle">
    <slot></slot>
  </div>
</template>

<style lang="scss">
@import './_variables';
@import './_mixins';

.cp-column {
  max-width: 100%;
  flex: 1 0 0%;
}

@include create-column('column');

@include screen-md {
  @include create-column('column', 'md');
}
</style>
