<script setup lang="ts">
import { computed, reactive } from 'vue';
import type * as CSS from 'csstype';

type Shimmer = {
  /**
   * Toggle Shimmer animation.
   */
  animate?: boolean;
  /**
   * Set the Shimmer as block level element.
   */
  block?: boolean;
  /**
   * Set the Shimmer CSS width.
   */
  width?: CSS.Property.Width;
  /**
   * Set the Shimmer CSS height.
   */
  height?: CSS.Property.Height;
  /**
   * Set the Shimmer CSS border-radius.
   */
  radius?: CSS.Property.BorderRadius;
  /**
   * Set the Shimmer CSS width.
   */
  margin?: CSS.Property.Margin;
}

const props = withDefaults(defineProps<Shimmer>(), {
  animate: false,
});

const classes = computed(() => ({
  'cp-loader'                 : true,
  'cp-loader--shimmer'        : true,
  'cp-loader--shimmer-animate': props.animate,
}));
const styles = reactive({
  display     : props.block ? 'block' : undefined,
  width       : props.width,
  height      : props.height,
  borderRadius: props.radius,
  margin      : props.margin,
});
</script>

<template>
  <div :class="classes" :style="styles" />
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
