<script setup lang="ts">
// Common Components
import { Text } from '@/components';
import ComposIcon, { CheckLarge } from '@/components/Icons';

// View Components
import ProductImage from '@/views/components/ProductImage.vue';

// Assets
import no_image from '@assets/illustration/no_image.svg';

type ProductSelectionItem = {
  images?: string[];
  name: string;
  indent?: number;
  selected?: boolean;
  small?: boolean;
};

withDefaults(defineProps<ProductSelectionItem>(), {
  active: true,
  images: () => [],
  selected: false,
  small   : false,
});
</script>

<template>
  <div
    class="vc-product-selection-item"
    role="checkbox"
    :data-selected="selected ? true : undefined"
    :data-indent="indent ? indent : undefined"
    :aria-checked="selected"
    tabindex="0"
  >
    <div
      v-if="indent"
      class="vc-product-selection-item__indent"
      :style="{ marginLeft: indent > 1 ? `${(indent - 1) * 60}px` : undefined }"
    />
    <ProductImage>
      <img v-if="images.length" v-for="image of images" :src="image" :alt="`${name} image`" />
      <img v-else :src="no_image" :alt="`${name} image`" />
    </ProductImage>
    <div class="vc-product-selection-item__body">
      <Text body="large" fontWeight="600" truncate margin="0">{{ name }}</Text>
    </div>
    <ComposIcon v-if="selected" :icon="CheckLarge" class="vc-product-selection-item__icon" />
  </div>
</template>

<style lang="scss">
.vc-product-selection-item {
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-neutral-2);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  position: relative;

  &:last-of-type {
    border-bottom-color: transparent;
  }

  > * {
    flex-shrink: 0;
  }

  .vc-product-image {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    align-self: flex-start;
  }

  &__body {
    min-width: 0;
    flex-grow: 1;
    flex-shrink: 1;
  }

  &[data-indent] {
    background-color: var(--color-neutral-1);

    .vc-product-selection-item__indent {
      width: 60px;
      align-self: stretch;
      position: relative;
      user-select: none;
      pointer-events: none;
      margin-top: -13px;
      margin-bottom: -13px;
      margin-right: -16px;

      &::before,
      &::after {
        content: "";
        position: absolute;
        background-color: var(--color-neutral-4);
      }

      &::before {
        content: "";
        width: 4px;
        height: 100%;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
      }

      &::after {
        content: "";
        width: 16px;
        height: 4px;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        top: 50%;
        left: calc(50% + 2px);
        transform: translateY(-50%);
      }
    }

    &:not(:has(~ &)) {
      .vc-product-selection-item__indent {
        &::before {
          height: calc(50% + 2px);
          border-bottom-left-radius: 4px;
        }
      }
    }
  }

  &[data-selected] {
    background-color: var(--color-blue-1);
  }
}
</style>
