<script setup lang="ts">
import type * as CSS from 'csstype';

type Bar = {
  /**
   * Set the color of the Bar.
   */
  color?: CSS.Property.BackgroundColor;
  /**
   * Set the Bar **container** CSS height.
   */
  height?: CSS.Property.Height;
  /**
   * Set the Bar **container** CSS margin.
   */
  margin?: CSS.Property.Margin;
  /**
   * Set the Bar size.
   */
  size?: CSS.Property.Width | CSS.Property.Height;
  /**
   * Set the Bar **container** CSS width.
   */
  width?: CSS.Property.Width;
};

withDefaults(defineProps<Bar>(), {
  color: 'var(--color-black)',
});
</script>

<template>
  <div class="cp-loader cp-loader--bar" :style="{ width, height, margin }">
    <span :style="{ width: size, height: size }" />
  </div>
</template>

<style lang="scss">
.cp-loader--bar {
  --loader-color: no-repeat linear-gradient(v-bind(color) calc(50% - 10px), transparent 0 calc(50% + 10px), v-bind(color) 0);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    width: 45px;
    height: 45px;
    display: block;
    background:
      var(--loader-color) 0% 100%,
      var(--loader-color) 50% 100%,
      var(--loader-color) 100% 100%;
    background-size: 20% calc(200% + 20px);
    animation: bar-loader 1s infinite linear;
  }
}

@keyframes bar-loader {
  33% {
    background-position:
      0% 50%,
      50% 100%,
      100% 100%;
  }
  50% {
    background-position:
      0% 0%,
      50% 50%,
      100% 100%;
  }
  66% {
    background-position:
      0% 0%,
      50% 0%,
      100% 50%;
  }
  100% {
    background-position:
      0% 0%,
      50% 0%,
      100% 0%;
  }
}
</style>
