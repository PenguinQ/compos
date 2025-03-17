<script setup lang="ts">
// Common Components
import { Text } from '@/components';

// View Components
import ProductImage from '@/views/components/ProductImage.vue';

// Assets
import no_image from '@assets/illustration/no_image.svg';

type ProductItemDetail = {
  name: string;
  value: string;
};

type ProductItem = {
  active?: boolean;
  details?: ProductItemDetail[];
  images?: string[];
  name: string;
};

withDefaults(defineProps<ProductItem>(), {
  active: true,
  images: () => [],
});
</script>

<template>
  <div class="vc-product-list-item" :data-status="!active ? 'inactive' : undefined">
    <ProductImage>
      <img v-if="images.length" v-for="image of images" :src="image" :alt="`${name} image`" />
      <img v-else :src="no_image" :alt="`${name} image`" />
    </ProductImage>
    <div class="vc-product-list-item__body">
      <Text body="large" fontWeight="600" truncate margin="0">{{ name }}</Text>
      <div v-if="details" class="vc-product-list-item__details">
        <table>
          <tr v-for="detail of details">
            <td><span>{{ detail.name }}</span></td>
            <td>:</td>
            <td>{{ detail.value }}</td>
          </tr>
        </table>
      </div>
      <slot name="details"></slot>
    </div>
    <slot name="extension"></slot>
  </div>
</template>

<style lang="scss">
.vc-product-list-item {
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  position: relative;

  &:last-of-type {
    border-bottom-color: transparent;
  }

  &::before {
    content: attr(data-status);
    @include text-body-xs;
    color: var(--color-white);
    background-color: var(--color-red-4);
    font-weight: 600;
    text-transform: capitalize;
    border-bottom-right-radius: 4px;
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    padding: 4px 8px;
    z-index: 1;
  }

  > * {
    flex-shrink: 0;
  }

  .vc-product-image {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    display: none;
    align-self: flex-start;
  }

  &__body {
    min-width: 0;
    flex-grow: 1;
    flex-shrink: 1;
  }

  &__details {
    overflow-x: auto;

    table {
      width: 100%;
      @include text-body-sm;
      border-collapse: collapse;
      opacity: 0.8;
      margin-top: 2px;

      td {
        padding: 2px 0;

        &:last-of-type {
          padding-left: 1ch;
        }

        &:not(:last-of-type) {
          width: 0;
          white-space: nowrap;
        }
      }
    }
  }

  &[data-status] {
    &::before {
      display: block;
    }

    .vc-product-image,
    .vc-product-list-item__body {
      filter: grayscale(1);
    }
  }
}

@include screen-rwd(360) {
  .vc-product-list-item {
    gap: 16px;

    .vc-product-image {
      display: grid;
    }
  }
}
</style>
