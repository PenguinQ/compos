<script setup lang="ts">
import { computed, reactive } from 'vue';
import type * as CSS from 'csstype';

type ShimmerProps = {
  animate?: boolean;
  block?: boolean;
  width?: CSS.Property.Width;
  height?: CSS.Property.Height;
  radius?: CSS.Property.BorderRadius;
  margin?: CSS.Property.Margin;
}

const props = withDefaults(defineProps<ShimmerProps>(), {
  animate: false,
});

const shimmerClass = computed(() => ({
  'cp-loader': true,
  'cp-loader--shimmer': true,
  'cp-loader--shimmer-animate': props.animate,
}));
const shimmerStyle = reactive({
  display: props.block ? 'block' : undefined,
  width: props.width,
  height: props.height,
  borderRadius: props.radius,
  margin: props.margin,
});
</script>

<template>
  <div :class="shimmerClass" :style="shimmerStyle" />
</template>

<style lang="scss">
@keyframes animation {
  0%, 100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}

.cp-loader--shimmer {
  width: 100px;
  height: 100px;
  background-color: #CED3DC;
  display: inline-flex;
  border-radius: 8px;
  vertical-align: top;

  &-animate {
    animation: animation 1500ms ease-in-out infinite;
  }
}
</style>
