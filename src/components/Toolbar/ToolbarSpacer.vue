<script setup lang="ts">
import type * as CSS from 'csstype';

type ToolbarSpacerProps = {
  width?: CSS.Property.Width;
};

defineProps<ToolbarSpacerProps>();
</script>

<template>
  <div class="cp-toolbar-spacer" :style="{ width }" />
</template>

<style lang="scss">
.cp-toolbar-spacer {
  flex-grow: 1;
  flex-shrink: 0;
}
</style>
