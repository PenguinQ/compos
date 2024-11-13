<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

// Common Components
import { Button, Text } from '@/components';
import ComposIcon, { CheckLarge, XLarge } from '@/components/Icons';

// View Components
import ProductImage from '@/views/components/ProductImage.vue';

// Helpers
import { toIDR } from '@/helpers';

// Assets
import no_image from '@assets/illustration/no_image.svg';

type ProductSelection = {
  display?: boolean;
  images?: string[];
  name: string;
  price?: string;
  sku?: string;
  stock?: number;
  quantity?: number;
  quantityMax?: number;
  selected?: boolean;
  small?: boolean;
  variant?: boolean;
  clickRemove?: () => void;
};

const props = withDefaults(defineProps<ProductSelection>(), {
  display: false,
  images: () => [],
  selected: false,
  small: false,
});
defineEmits([
  'inputQuantity',
  'changeQuantity',
  'clickQuantityDecrement',
  'clickQuantityIncrement',
]);

const QuantityEditor = defineAsyncComponent(() => import('@/components/QuantityEditor/QuantityEditor.vue'));
const classes = computed(() => ({
  'vc-product-selection': true,
  'vc-product-selection--small': props.small,
  'vc-product-selection--display': props.display,
  'vc-product-selection--variant': props.variant,
}));
</script>

<template>
  <div
    :class="classes" :data-selected="selected ? true : undefined"
    role="checkbox"
    :aria-checked="selected"
    tabindex="0"
  >
    <ProductImage>
      <img v-if="images.length" v-for="image of images" :src="image" :alt="`${name} Image`" />
      <img v-else :src="no_image" :alt="`${name} image`">
    </ProductImage>
    <div class="vc-product-selection__body">
      <Text body="large" truncate margin="0">{{ name }}</Text>
      <div v-if="price || sku" class="vc-product-selection__info">
        <Text v-if="price" body="small" truncate margin="0 0 2px">Price: {{ toIDR(price) }}</Text>
        <Text v-if="stock" body="small" truncate margin="0 0 2px">Stock: {{ stock }}</Text>
        <Text v-if="sku" body="small" truncate margin="0">SKU: {{ sku }}</Text>
      </div>
    </div>
    <QuantityEditor
      v-if="quantity !== undefined"
      :value="quantity"
      :min="1"
      :max="quantityMax"
      @change="$emit('changeQuantity', $event)"
      @input="$emit('inputQuantity', $event)"
      @clickDecrement="$emit('clickQuantityDecrement', $event)"
      @clickIncrement="$emit('clickQuantityIncrement', $event)"
    />
    <ComposIcon v-if="selected" :icon="CheckLarge" class="vc-product-selection__marker" />
    <Button
      v-if="$attrs.onClickRemove"
      class="vc-product-selection__action"
      color="red"
      icon
      :aria-label="`Remove ${name}`"
      @click="$attrs.onClickRemove"
    >
      <ComposIcon :icon="XLarge" size="18" />
    </Button>
  </div>
</template>

<style lang="scss">
.vc-product-selection {
  background-color: var(--color-white);
  border: 1px solid var(--color-neutral-2);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;

  & + .vc-product-selection {
    margin-top: -1px;
  }

  > * {
    flex-shrink: 0;
  }

  picture {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    display: none;
  }

  &__body {
    min-width: 0;
    flex-grow: 1;
    flex-shrink: 1;
  }

  &__info {
    opacity: 0.8;
    margin-top: 4px;
  }

  &--small {
    picture {
      width: 60px;
      height: 60px;
    }
  }

  &--variant {
    background-color: var(--color-neutral-1);
    padding-left: 48px;
  }

  &--display {
    &:first-of-type {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    &:last-of-type {
      border-bottom-right-radius: 8px;
      border-bottom-left-radius: 8px;
    }
  }

  &[data-selected] {
    background-color: var(--color-blue-1);
  }

  &[role="button"] {
    cursor: pointer;
  }
}

@include screen-rwd(360) {
  .vc-product-selection {
    gap: 16px;

    picture {
      display: grid;
    }
  }
}
</style>
