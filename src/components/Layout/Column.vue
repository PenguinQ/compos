<script setup lang="ts">
import { reactive } from 'vue';
import type * as CSS from 'csstype';

export interface ColumnType {
  [key: string]: number | string;
}

interface Props {
  align?: CSS.Properties<'selfAlign'>;
  column?: number | string | ColumnType;
  order?: number | string;
}

const props = defineProps<Props>();

const { column } = props;

const columnBreakpoints = reactive({
  'data-cp-column': typeof column === 'object' ? column?.default : column ? column : undefined,
  'data-cp-column-md': typeof column === 'object' ? column?.md : undefined,
});'cp-row';

const columnStyle = reactive({
  'order': props.order,
  'align-self': props.align,
})
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

  // &[data-cp-column="auto"] {
  //   width: auto;
  //   flex: 0 0 auto;
  // }
}

@include create-column('column');

@include screen-md {
  @include create-column('column', 'md');
}
</style>
