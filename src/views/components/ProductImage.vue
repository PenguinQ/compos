<script setup lang="ts">
import * as CSS from 'csstype';

type ProductImageProps = {
  width?: CSS.Property.Width;
  height?: CSS.Property.Height;
};

defineProps<ProductImageProps>();
</script>

<template>
  <picture class="vc-product-image" :style="{ width, height }">
    <slot />
  </picture>
</template>

<style lang="scss">
.vc-product-image {
  width: 180px;
  height: 180px;
  background-color: var(--color-white);
  border: 1px solid var(--color-neutral-2);
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  overflow: hidden;
  margin: 0 auto;

  img {
    min-height: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;

    &:only-child {
      grid-column: span 2;
    }
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    color: var(--color-white);
    font-size: 26px;
    line-height: 1px;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
