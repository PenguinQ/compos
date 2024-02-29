<script setup lang="ts">
import { reactive } from 'vue';
import type * as CSS from 'csstype';

type Props = {
  padding?: CSS.Property.Padding;
};

const props = defineProps<Props>();

const headingStyles = reactive({
  padding: props.padding,
});
</script>

<template>
  <div class="cp-card__header" :styles="headingStyles">
    <slot />
  </div>
</template>

<style lang="scss">
.cp-card__header {
  padding: 16px;
}
</style>
