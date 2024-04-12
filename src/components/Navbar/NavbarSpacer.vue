<script setup lang="ts">
import type * as CSS from 'csstype';

type NavbarSpacerProps = {
  width?: CSS.Property.Width;
};

defineProps<NavbarSpacerProps>();
</script>

<template>
  <div class="cp-navbar__spacer" :style="{ width }" />
</template>

<style lang="scss">
.cp-navbar__spacer {
  flex-grow: 1;
  flex-shrink: 0;
}
</style>
