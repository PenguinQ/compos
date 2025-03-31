<script setup lang="ts">
// Common Components
import { Text } from '@/components';
import * as CSS from 'csstype';

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
  imageWidth?: CSS.Property.Width;
  imageHeight?: CSS.Property.Height;
  name?: string;
};

withDefaults(defineProps<ProductItem>(), {
  active: true,
  images: () => [],
});
</script>

<template>
  <div class="vc-pli" :data-status="!active ? 'inactive' : undefined">
    <ProductImage :width="imageWidth" :height="imageHeight">
      <img v-if="images.length" v-for="image of images" :src="image" :alt="`${name} image`" />
      <img v-else :src="no_image" :alt="`${name} image`" />
    </ProductImage>
    <div class="vc-pli-info">
      <div class="vc-pli-info__main">
        <div class="vc-pli-info__content">
          <Text v-if="name" class="vc-pli-info__name" body="large" truncate>
            {{ name }}
          </Text>
          <div v-if="details" class="vc-pli-info__details">
            <table>
              <tr v-for="detail of details">
                <td><span>{{ detail.name }}</span></td>
                <td>:</td>
                <td>{{ detail.value }}</td>
              </tr>
            </table>
          </div>
          <slot name="details" />
        </div>
        <slot name="extensions" />
      </div>
      <slot name="additionals" />
    </div>
  </div>
</template>

<style lang="scss">
.vc-pli {
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

  .vc-product-image {
    width: 80px;
    height: 80px;
    align-self: flex-start;
    flex-shrink: 0;
    display: none;
  }

  &-info {
    min-width: 0;
    flex-grow: 1;
    flex-shrink: 1;

    &__main {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;

      > * {
        flex-shrink: 0;
      }
    }

    &__content {
      min-width: 0;
      flex-grow: 1;
      flex-shrink: 1;
    }

    &__name {
      font-weight: 600;
      margin-bottom: 4px;

      &:only-child {
        margin: 0;
      }
    }

    &__details {
      overflow-x: auto;
      margin-top: -2px;

      table {
        width: 100%;
        @include text-body-sm;
        border-collapse: collapse;
        opacity: 0.8;

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
  }

  &[data-status] {
    &::before {
      display: block;
    }

    .vc-product-image,
    .vc-pli-info {
      filter: grayscale(1);
    }
  }
}

@include screen-rwd(360) {
  .vc-pli {
    gap: 16px;

    .vc-product-image {
      display: grid;
    }
  }
}
</style>
