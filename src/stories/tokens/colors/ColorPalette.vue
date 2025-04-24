<script setup lang="ts">
import ColorBlock from './ColorBlock.vue';

type ColorPalette = {
  color: 'neutral' | 'red' | 'green' | 'blue' | 'yellow' | 'stone';
};

defineProps<ColorPalette>();

const windowStyle = window.getComputedStyle(document.body);

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const getContrastColor = (color: string) => {
  const hexValue = windowStyle.getPropertyValue(color);
  const rgbValues = hexToRgb(hexValue);

  if (rgbValues) {
    const luminance = (0.299 * rgbValues.r + 0.587 * rgbValues.g + 0.114 * rgbValues.b) / 255;

    return luminance > 0.5 ? 'var(--color-black)' : 'var(--color-white)';
  }

  return 'var(--color-black)';
};
</script>

<template>
  <div class="color-palette">
    <ColorBlock
      v-for="i in 7" :key="`${color}-${i}`"
      :color="getContrastColor(`--color-${color}-${i}`)"
      :backgroundColor="`var(--color-${color}-${i})`"
    >
      <span>{{ `--color-${color}-${i}` }}</span>
      <span>{{ windowStyle.getPropertyValue(`--color-${color}-${i}`) }}</span>
    </ColorBlock>
  </div>
</template>
