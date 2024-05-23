<script setup lang="ts">
import type * as CSS from 'csstype';

type BarProps = {
  width?: CSS.Property.Width;
  height?: CSS.Property.Height;
  size?: CSS.Property.Width | CSS.Property.Height;
  margin?: CSS.Property.Margin;
};

defineProps<BarProps>();
</script>

<template>
  <div class="cp-loader cp-loader--bar" :style="{ width, height, margin }">
    <span :style="{ width: size, height: size }" />
  </div>
</template>

<style lang="scss">
.cp-loader--bar {
  --background: no-repeat linear-gradient(var(--color-black) calc(50% - 10px), transparent 0 calc(50% + 10px), var(--color-black) 0);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    width: 45px;
    height: 45px;
    display: block;
    background:
      var(--background) 0% 100%,
      var(--background) 50% 100%,
      var(--background) 100% 100%;
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
