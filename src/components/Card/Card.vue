<script setup lang="ts">
import { reactive } from 'vue';
import type * as CSS from 'csstype';

interface Props {
  margin?: CSS.Property.Margin;
  padding?: CSS.Property.Padding;
}

const props = defineProps<Props>();

const cardStyles = reactive({
  margin: props.margin,
  padding: props.padding,
});
</script>

<template>
  <div class="cp-card" :style="cardStyles"></div>
</template>

<style lang="scss"></style>
