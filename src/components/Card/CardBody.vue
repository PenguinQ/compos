<script setup lang="ts">
import { reactive } from 'vue';
import type * as CSS from 'csstype';

type Props = {
  padding?: CSS.Property.Padding;
};

const props = defineProps<Props>();

const bodyStyles = reactive({
  padding: props.padding,
});
</script>

<template>
  <div class="cp-card__body" :style="bodyStyles">
    <slot />
  </div>
</template>

<style lang="scss">
.cp-card__body {
  padding: 16px;

  .cp-card__header + & {
    padding: 0 16px 16px;
  }
}
</style>
